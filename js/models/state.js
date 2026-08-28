/* =============================================
   MUNDO DAS HISTÓRIAS — state.js (Model)
   ============================================= */

'use strict';

let estado = {
  perfil: { nome: '', avatar: 'midia/lion.png', faixa: 1, genero: 'narrativo' },
  nivel: 'iniciante', // iniciante | intermediario | avancado
  totalEstrelas: 0,
  historiasLidas: [],  // [{id, estrelas, data}]
  tempoTotal: 0,       // minutos
  minigamesJogados: 0,
  tentativasReprovadas: 0,
  acertosMG: 0,
  errosMG: 0,
  naoConsigoOuvir: 0,
  historiaAtual: null,
  acertos: 0,
  ajudas: 0,
  minigameAtual: 0,
  minigamesLista: [],
  minigamesPreset: null,
  mgAcertos: 0,
  iniciouEm: null,
  filtroGenero: 'todos',
  filtroFaixa: 'todos',
  destaqueAtivo: false,
  modoLeituraCompleta: false,
  relatorioEventos: [], // eventos locais por minigame
  vidasPerdidas: [],   // fallback legado
  vidasPerdidasPorCrianca: {} // mapa { [childKey]: [timestamps (ms)] } por perfil infantil
};

let syncTimer = null;
const CHAVE_VIDAS_PERSISTENTES = 'mundoHistorias_vidas_criancas';

function obterChaveEstadoCrianca(childId) {
  if (!childId) return null;
  return `mundoHistorias_estado_crianca_${childId}`;
}

function resetarProgressoEmMemoria() {
  estado.totalEstrelas = 0;
  estado.historiasLidas = [];
  estado.tempoTotal = 0;
  estado.minigamesJogados = 0;
  estado.tentativasReprovadas = 0;
  estado.acertosMG = 0;
  estado.errosMG = 0;
  estado.naoConsigoOuvir = 0;
  estado.atividadeDiaria = [];
  estado.relatorioEventos = [];
  estado.nivel = 'iniciante';
}

function aplicarDadosProgresso(dados) {
  if (!dados) return;

  if (Array.isArray(dados.vidasPerdidas)) {
    estado.vidasPerdidas = dados.vidasPerdidas;
  }
  if (dados.vidasPerdidasPorCrianca && typeof dados.vidasPerdidasPorCrianca === 'object') {
    estado.vidasPerdidasPorCrianca = Object.assign({}, estado.vidasPerdidasPorCrianca, dados.vidasPerdidasPorCrianca);
  }

  estado.historiasLidas = Array.isArray(dados.historiasLidas) ? dados.historiasLidas : [];
  estado.atividadeDiaria = Array.isArray(dados.atividadeDiaria) ? dados.atividadeDiaria : [];
  estado.relatorioEventos = Array.isArray(dados.relatorioEventos) ? dados.relatorioEventos : [];

  estado.totalEstrelas = Number(dados.totalEstrelas) || 0;
  estado.tempoTotal = Number(dados.tempoTotal) || 0;
  estado.minigamesJogados = Number(dados.minigamesJogados) || 0;
  estado.tentativasReprovadas = Number(dados.tentativasReprovadas) || 0;
  estado.acertosMG = Number(dados.acertosMG) || 0;
  estado.errosMG = Number(dados.errosMG) || 0;
  estado.naoConsigoOuvir = Number(dados.naoConsigoOuvir) || 0;

  if (estado.minigamesJogados > 0) {
    if (estado.acertosMG > estado.minigamesJogados) {
      estado.acertosMG = estado.minigamesJogados;
    }
    if (estado.acertosMG + estado.errosMG > estado.minigamesJogados) {
      estado.errosMG = Math.max(0, estado.minigamesJogados - estado.acertosMG);
    }
  }

  if (dados.perfil) {
    estado.perfil = typeof normalizarPerfilCrianca === 'function' ? normalizarPerfilCrianca(dados.perfil) : dados.perfil;
  }
  estado.nivel = typeof calcularNivelPorXp === 'function' ? calcularNivelPorXp(estado.totalEstrelas) : 'iniciante';
}

function salvarEstado() {
  const dados = {
    perfil: estado.perfil,
    vidasPerdidas: estado.vidasPerdidas || [],
    vidasPerdidasPorCrianca: estado.vidasPerdidasPorCrianca || {},
    historiasLidas: estado.historiasLidas || [],
    atividadeDiaria: estado.atividadeDiaria || [],
    relatorioEventos: estado.relatorioEventos || [],
    totalEstrelas: estado.totalEstrelas || 0,
    tempoTotal: estado.tempoTotal || 0,
    minigamesJogados: estado.minigamesJogados || 0,
    tentativasReprovadas: estado.tentativasReprovadas || 0,
    acertosMG: estado.acertosMG || 0,
    errosMG: estado.errosMG || 0,
    naoConsigoOuvir: estado.naoConsigoOuvir || 0
  };

  localStorage.setItem('mundoHistorias_estado', JSON.stringify(dados));

  const childId = estado?.perfil?.id || estado?.perfil?.Id;
  if (childId) {
    const chaveCrianca = obterChaveEstadoCrianca(childId);
    if (chaveCrianca) {
      localStorage.setItem(chaveCrianca, JSON.stringify(dados));
    }
  }

  try {
    localStorage.setItem(CHAVE_VIDAS_PERSISTENTES, JSON.stringify(estado.vidasPerdidasPorCrianca || {}));
  } catch (_) { }

  agendarSyncProgresso();
}

function carregarEstado() {
  resetarProgressoEmMemoria();

  const raw = localStorage.getItem('mundoHistorias_estado');
  let dados = null;
  if (raw) {
    try {
      dados = JSON.parse(raw);
    } catch (e) { /* ignora */ }
  }

  if (dados) {
    const childId = dados.perfil?.id || dados.perfil?.Id;
    let dadosCrianca = dados;

    if (childId) {
      const chaveCrianca = obterChaveEstadoCrianca(childId);
      const rawCrianca = localStorage.getItem(chaveCrianca);
      if (rawCrianca) {
        try {
          const parsedC = JSON.parse(rawCrianca);
          if (parsedC) {
            dadosCrianca = parsedC;
            if (dados.perfil) dadosCrianca.perfil = dados.perfil;
          }
        } catch (_) { }
      }
    }

    aplicarDadosProgresso(dadosCrianca);
  }

  try {
    const rawVidas = localStorage.getItem(CHAVE_VIDAS_PERSISTENTES);
    if (rawVidas) {
      const vidasPersistidas = JSON.parse(rawVidas);
      if (vidasPersistidas && typeof vidasPersistidas === 'object') {
        estado.vidasPerdidasPorCrianca = Object.assign({}, vidasPersistidas, estado.vidasPerdidasPorCrianca);
      }
    }
  } catch (_) { }
}

function trocarPerfilCriancaEstado(perfilNovo) {
  if (estado?.perfil?.id || estado?.perfil?.Id) {
    salvarEstado();
  }

  resetarProgressoEmMemoria();

  const perfilNorm = typeof normalizarPerfilCrianca === 'function' ? normalizarPerfilCrianca(perfilNovo) : perfilNovo;
  const childId = perfilNorm?.id || perfilNorm?.Id;

  estado.perfil = perfilNorm;

  if (childId) {
    const chaveCrianca = obterChaveEstadoCrianca(childId);
    const rawCrianca = localStorage.getItem(chaveCrianca);
    if (rawCrianca) {
      try {
        const dadosCrianca = JSON.parse(rawCrianca);
        if (dadosCrianca) {
          aplicarDadosProgresso(dadosCrianca);
        }
      } catch (_) { }
    }
  }

  estado.perfil = perfilNorm;
  salvarEstado();
}

function garantirContadoresRelatorio() {
  const eventos = estado.relatorioEventos || [];
  if (!eventos.length) return;
  const naoOucoEventos = eventos.filter(e => e.acao === 'nao_consigo_ouvir').length;
  estado.naoConsigoOuvir = Math.max(Number(estado.naoConsigoOuvir) || 0, naoOucoEventos);

  if (estado.minigamesJogados > 0) {
    if (estado.acertosMG > estado.minigamesJogados) {
      estado.acertosMG = estado.minigamesJogados;
    }
    if (estado.acertosMG + estado.errosMG > estado.minigamesJogados) {
      estado.errosMG = Math.max(0, estado.minigamesJogados - estado.acertosMG);
    }
  }
}

function obterVinculoCrianca() {
  try {
    const criancaId = estado?.perfil?.id || estado?.perfil?.Id;
    const responsavelId = obterResponsavelId();
    if (!criancaId) return null;
    return { criancaId: Number(criancaId), responsavelId: responsavelId ? Number(responsavelId) : null };
  } catch (_) {
    return null;
  }
}

function obterResponsavelId() {
  try {
    const sessao = JSON.parse(localStorage.getItem('mundoHistorias_responsavel_sessao') || 'null');
    return sessao?.responsavelId || sessao?.ResponsavelId || null;
  } catch (_) {
    return null;
  }
}

function agendarSyncProgresso() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    enviarSyncProgresso();
  }, 1000);
}

async function enviarSyncProgresso() {
  const sessao = (() => {
    try { return JSON.parse(localStorage.getItem('mundoHistorias_responsavel_sessao') || 'null'); } catch (_) { return null; }
  })();
  const vinculo = obterVinculoCrianca();
  const respId = sessao?.responsavelId || sessao?.ResponsavelId || vinculo?.responsavelId;
  const childId = vinculo?.criancaId || estado?.perfil?.id || estado?.perfil?.Id;

  if (!respId || !childId) return;

  try {
    await apiPost('/api/v1/sync/progress', {
      responsavelId: Number(respId),
      criancaId: Number(childId),
      faixaEtaria: Number(estado.perfil?.faixa) || 1,
      progressoHistorias: {
        totalEstrelas: estado.totalEstrelas || 0,
        historiasLidas: estado.historiasLidas || [],
        atividadeDiaria: estado.atividadeDiaria || [],
        tempoTotal: estado.tempoTotal || 0
      },
      resumoMinigames: {
        minigamesJogados: estado.minigamesJogados || 0,
        tentativasReprovadas: estado.tentativasReprovadas || 0,
        acertosMG: estado.acertosMG || 0,
        errosMG: estado.errosMG || 0,
        naoConsigoOuvir: estado.naoConsigoOuvir || 0
      },
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Falha ao sincronizar progresso com o banco:', err);
  }
}

async function carregarProgressoDoServidor() {
  const sessao = (() => {
    try { return JSON.parse(localStorage.getItem('mundoHistorias_responsavel_sessao') || 'null'); } catch (_) { return null; }
  })();
  const vinculo = obterVinculoCrianca();
  const respId = sessao?.responsavelId || sessao?.ResponsavelId || vinculo?.responsavelId;
  const childId = vinculo?.criancaId || estado?.perfil?.id || estado?.perfil?.Id;

  if (!respId || !childId) return;

  try {
    const query = new URLSearchParams({
      responsavelId: String(respId),
      criancaId: String(childId)
    });
    const data = await apiGet(`/api/v1/sync/progress?${query.toString()}`);
    if (data) {
      mesclarProgressoServidor(data);
    }
  } catch (err) {
    console.warn('Falha ao carregar progresso do banco:', err);
  }
}

function mesclarProgressoServidor(servidor) {
  if (!servidor) return;

  const prog = servidor.progressoHistorias || servidor.ProgressoHistorias || servidor;
  const resumo = servidor.resumoMinigames || servidor.ResumoMinigames || servidor;

  const remoto = Array.isArray(servidor.historiasLidas)
    ? servidor.historiasLidas
    : (Array.isArray(prog.historiasLidas)
      ? prog.historiasLidas
      : (Array.isArray(servidor.HistoriasLidas)
        ? servidor.HistoriasLidas
        : (Array.isArray(prog.HistoriasLidas)
          ? prog.HistoriasLidas
          : [])));

  // Combina lista local e remota mantendo todos os eventos de leitura individuais
  const listaCombinada = [...(estado.historiasLidas || []), ...remoto];
  const unicos = [];
  const chavesVistas = new Set();

  listaCombinada.forEach((r) => {
    if (!r || (r.id == null && r.Id == null)) return;
    const idStr = String(r.id || r.Id);
    const idNorm = typeof normalizarIdHistoria === 'function' ? normalizarIdHistoria(idStr) : idStr.replace('api-', '');
    const dataStr = r.dataIso || r.DataIso || r.data || r.Data || '';
    const est = Number(r.estrelas || r.Estrelas) || 0;
    const ts = r.timestamp || r.Timestamp || '';

    let titulo = r.titulo || r.Titulo || '';
    let emoji = r.emoji || r.Emoji || '';
    let genero = r.genero || r.Genero || '';

    if (!titulo && typeof HISTORIAS !== 'undefined') {
      const hFound = HISTORIAS.find(x => {
        const xNorm = typeof normalizarIdHistoria === 'function' ? normalizarIdHistoria(x.id) : String(x.id).replace('api-', '');
        return xNorm === idNorm || String(x.id) === idStr;
      });
      if (hFound) {
        titulo = hFound.titulo || '';
        emoji = emoji || hFound.emoji || '📖';
        genero = genero || hFound.genero || 'narrativo';
      }
    }

    const canonicalId = `api-${idNorm}`;
    const chave = ts ? `${idNorm}_${ts}` : `${idNorm}_${dataStr || 'data'}`;

    const existenteIdx = unicos.findIndex(u => {
      const uNorm = typeof normalizarIdHistoria === 'function' ? normalizarIdHistoria(u.id) : String(u.id).replace('api-', '');
      return uNorm === idNorm && (ts ? u.timestamp === ts : true);
    });

    if (existenteIdx < 0 && !chavesVistas.has(chave)) {
      chavesVistas.add(chave);
      unicos.push({
        id: canonicalId,
        titulo: titulo,
        emoji: emoji || '📖',
        genero: genero || 'narrativo',
        estrelas: est,
        data: r.data || r.Data || '',
        dataIso: r.dataIso || r.DataIso || (typeof obterDataIsoHistoria === 'function' ? obterDataIsoHistoria(r) : '') || '',
        timestamp: ts || Date.now()
      });
    } else if (existenteIdx >= 0) {
      const u = unicos[existenteIdx];
      u.estrelas = Math.max(u.estrelas, est);
      if (!u.titulo && titulo) u.titulo = titulo;
      if ((!u.emoji || u.emoji === '📖') && emoji) u.emoji = emoji;
      if (!u.genero && genero) u.genero = genero;
      if (!u.data && (r.data || r.Data)) u.data = r.data || r.Data;
      if (!u.dataIso && (r.dataIso || r.DataIso)) u.dataIso = r.dataIso || r.DataIso;
    }
  });

  estado.historiasLidas = unicos;
  recalcularTotalEstrelas();
  salvarEstado();

  const atividadeRemota = Array.isArray(servidor.atividadeDiaria)
    ? servidor.atividadeDiaria
    : (Array.isArray(prog.atividadeDiaria)
      ? prog.atividadeDiaria
      : (Array.isArray(servidor.AtividadeDiaria)
        ? servidor.AtividadeDiaria
        : null));

  if (atividadeRemota) {
    const mapaAtv = new Map();
    (estado.atividadeDiaria || []).forEach(a => {
      if (a && a.data) mapaAtv.set(a.data, Number(a.quantidade) || 0);
    });
    atividadeRemota.forEach(a => {
      if (!a) return;
      const dt = a.data || a.Data;
      const qtd = Number(a.quantidade || a.Quantidade) || 0;
      if (dt) mapaAtv.set(dt, Math.max(mapaAtv.get(dt) || 0, qtd));
    });
    estado.atividadeDiaria = Array.from(mapaAtv.entries()).map(([data, quantidade]) => ({ data, quantidade }));
  }

  const estTotalRemoto = servidor.totalEstrelas || prog.totalEstrelas || servidor.TotalEstrelas;
  if (estTotalRemoto != null && Number(estTotalRemoto) > 0) {
    estado.totalEstrelas = Math.max(estado.totalEstrelas, Number(estTotalRemoto));
  }
  estado.nivel = calcularNivelPorXp(estado.totalEstrelas);

  const tempoRemoto = servidor.tempoTotal || prog.tempoTotal || servidor.TempoTotal;
  if (tempoRemoto != null) {
    estado.tempoTotal = Math.max(Number(estado.tempoTotal) || 0, Number(tempoRemoto) || 0);
  }

  const mgJogadosRemoto = resumo.minigamesJogados || servidor.minigamesJogados;
  if (mgJogadosRemoto != null) {
    estado.minigamesJogados = Math.max(Number(estado.minigamesJogados) || 0, Number(mgJogadosRemoto) || 0);
  }

  const tentReprovadasRemoto = resumo.tentativasReprovadas || servidor.tentativasReprovadas;
  if (tentReprovadasRemoto != null) {
    estado.tentativasReprovadas = Math.max(Number(estado.tentativasReprovadas) || 0, Number(tentReprovadasRemoto) || 0);
  }

  const acertosRemoto = resumo.acertosMG || servidor.acertosMG;
  if (acertosRemoto != null) {
    estado.acertosMG = Math.max(Number(estado.acertosMG) || 0, Number(acertosRemoto) || 0);
  }

  const errosRemoto = resumo.errosMG || servidor.errosMG;
  if (errosRemoto != null) {
    estado.errosMG = Math.max(Number(estado.errosMG) || 0, Number(errosRemoto) || 0);
  }

  const naoOucoRemoto = resumo.naoConsigoOuvir || servidor.naoConsigoOuvir;
  if (naoOucoRemoto != null) {
    estado.naoConsigoOuvir = Math.max(Number(estado.naoConsigoOuvir) || 0, Number(naoOucoRemoto) || 0);
  }

  salvarEstado();
}

function recalcularTotalEstrelas() {
  estado.totalEstrelas = (estado.historiasLidas || []).reduce(
    (soma, r) => soma + (Number(r.estrelas) || 0),
    0
  );
  estado.nivel = calcularNivelPorXp(estado.totalEstrelas);
}

function calcularNivelPorXp(estrelas) {
  const e = Math.max(0, Number(estrelas !== undefined ? estrelas : estado.totalEstrelas) || 0);
  if (e >= 25) return 'avancado';
  if (e >= 10) return 'intermediario';
  return 'iniciante';
}

function obterFaixaXpAtual(estrelas) {
  const nivel = calcularNivelPorXp(estrelas);
  const faixas = [
    { id: 'iniciante', min: 0, max: 10 },
    { id: 'intermediario', min: 10, max: 25 },
    { id: 'avancado', min: 25, max: 50 }
  ];
  return faixas.find((f) => f.id === nivel) || faixas[0];
}

function adicionarExperiencia(quantidade, motivo) {
  const nivelAntes = estado.nivel;
  const nivelDepois = calcularNivelPorXp(estado.totalEstrelas);
  estado.nivel = nivelDepois;
  salvarEstado();
  atualizarHeader();
  if (typeof atualizarBarraExperiencia === 'function') atualizarBarraExperiencia();
  if (nivelDepois !== nivelAntes) {
    const labels = { intermediario: 'Intermediário 🌿', avancado: 'Avançado 🌳' };
    mostrarToast(`Você subiu de nível! Agora é ${labels[nivelDepois] || nivelDepois} ✨`);
  }
}

function obterDataConclusaoAtual() {
  const agora = new Date();
  return {
    data: agora.toLocaleDateString('pt-BR'),
    dataIso: agora.toISOString().slice(0, 10)
  };
}

function obterDataIsoHistoria(registro) {
  if (!registro) return null;
  if (registro.dataIso && /^\d{4}-\d{2}-\d{2}$/.test(registro.dataIso)) return registro.dataIso;
  if (!registro.data) return null;
  const m = String(registro.data).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}
