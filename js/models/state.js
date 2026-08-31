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
  vidasPerdidasPorCrianca: {}, // mapa { [childKey]: [timestamps (ms)] } por perfil infantil
  progressoCriancaId: null,
  syncPermitido: false
};

let syncTimer = null;
const CHAVE_VIDAS_PERSISTENTES = 'mundoHistorias_vidas_criancas';

function obterIdCriancaAtual() {
  const id = estado?.perfil?.id || estado?.perfil?.Id;
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function chaveProgressoLocal(criancaId) {
  return `mundoHistorias_progresso_${criancaId}`;
}

function snapshotProgresso() {
  return {
    progressoCriancaId: estado.progressoCriancaId || obterIdCriancaAtual(),
    historiasLidas: estado.historiasLidas || [],
    atividadeDiaria: estado.atividadeDiaria || [],
    relatorioEventos: estado.relatorioEventos || [],
    totalEstrelas: estado.totalEstrelas || 0,
    tempoTotal: estado.tempoTotal || 0,
    minigamesJogados: estado.minigamesJogados || 0,
    tentativasReprovadas: estado.tentativasReprovadas || 0,
    acertosMG: estado.acertosMG || 0,
    errosMG: estado.errosMG || 0,
    naoConsigoOuvir: estado.naoConsigoOuvir || 0,
    relatorioEventos: estado.relatorioEventos || []
  };
}

function limparProgressoMemoria() {
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
}

function aplicarSnapshotProgresso(dados) {
  if (!dados || typeof dados !== 'object') return;
  if (Array.isArray(dados.historiasLidas)) estado.historiasLidas = dados.historiasLidas;
  if (Array.isArray(dados.atividadeDiaria)) estado.atividadeDiaria = dados.atividadeDiaria;
  if (Array.isArray(dados.relatorioEventos)) estado.relatorioEventos = dados.relatorioEventos;
  if (dados.totalEstrelas != null) estado.totalEstrelas = Number(dados.totalEstrelas) || 0;
  if (dados.tempoTotal != null) estado.tempoTotal = Number(dados.tempoTotal) || 0;
  if (dados.minigamesJogados != null) estado.minigamesJogados = Number(dados.minigamesJogados) || 0;
  if (dados.tentativasReprovadas != null) estado.tentativasReprovadas = Number(dados.tentativasReprovadas) || 0;
  if (dados.acertosMG != null) estado.acertosMG = Number(dados.acertosMG) || 0;
  if (dados.errosMG != null) estado.errosMG = Number(dados.errosMG) || 0;
  if (dados.naoConsigoOuvir != null) estado.naoConsigoOuvir = Number(dados.naoConsigoOuvir) || 0;
}

function salvarEstado() {
  const criancaId = obterIdCriancaAtual();
  estado.progressoCriancaId = criancaId;

  const dados = {
    perfil: estado.perfil,
    vidasPerdidas: estado.vidasPerdidas || [],
    vidasPerdidasPorCrianca: estado.vidasPerdidasPorCrianca || {},
    progressoCriancaId: criancaId
  };
  localStorage.setItem('mundoHistorias_estado', JSON.stringify(dados));

  if (criancaId) {
    try {
      localStorage.setItem(chaveProgressoLocal(criancaId), JSON.stringify(snapshotProgresso()));
    } catch (_) { }
  }

  try {
    localStorage.setItem(CHAVE_VIDAS_PERSISTENTES, JSON.stringify(estado.vidasPerdidasPorCrianca || {}));
  } catch (_) { }
  agendarSyncProgresso();
}

function carregarEstado() {
  estado.syncPermitido = false;
  limparProgressoMemoria();
  estado.progressoCriancaId = null;
  let precisaSalvarFaixa = false;

  const raw = localStorage.getItem('mundoHistorias_estado');
  let dados = null;
  if (raw) {
    try {
      dados = JSON.parse(raw);
    } catch (e) { /* ignora */ }
  }

  if (dados) {
    if (Array.isArray(dados.vidasPerdidas)) {
      estado.vidasPerdidas = dados.vidasPerdidas;
    } else {
      estado.vidasPerdidas = [];
    }

    if (dados.vidasPerdidasPorCrianca && typeof dados.vidasPerdidasPorCrianca === 'object') {
      estado.vidasPerdidasPorCrianca = dados.vidasPerdidasPorCrianca;
    } else {
      estado.vidasPerdidasPorCrianca = {};
    }

    if (dados?.perfil) {
      const faixaAnterior = dados.perfil.faixa;
      estado.perfil = normalizarPerfilCrianca(dados.perfil);
      precisaSalvarFaixa = estado.perfil.faixa !== faixaAnterior;
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

  const criancaId = obterIdCriancaAtual();
  estado.progressoCriancaId = criancaId;
  if (!criancaId) {
    if (precisaSalvarFaixa) salvarEstado();
    return;
  }

  try {
    const rawProg = localStorage.getItem(chaveProgressoLocal(criancaId));
    if (rawProg) {
      const dedicado = JSON.parse(rawProg);
      const dono = Number(dedicado?.progressoCriancaId);
      if (dedicado && (Number.isNaN(dono) || dono === criancaId)) {
        aplicarSnapshotProgresso(dedicado);
      }
    }
  } catch (_) { }

  if (typeof recalcularTotalEstrelas === 'function') recalcularTotalEstrelas();
  if (precisaSalvarFaixa) salvarEstado();
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
    const criancaId = obterIdCriancaAtual();
    const responsavelId = obterResponsavelId();
    if (!criancaId) return null;
    return { criancaId, responsavelId: responsavelId ? Number(responsavelId) : null };
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
  if (!estado.syncPermitido) return;

  const sessao = (() => {
    try { return JSON.parse(localStorage.getItem('mundoHistorias_responsavel_sessao') || 'null'); } catch (_) { return null; }
  })();
  const vinculo = obterVinculoCrianca();
  const respId = sessao?.responsavelId || sessao?.ResponsavelId || vinculo?.responsavelId;
  const childId = vinculo?.criancaId || obterIdCriancaAtual();

  if (!respId || !childId) return;
  if (estado.progressoCriancaId != null && Number(estado.progressoCriancaId) !== Number(childId)) return;

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
  const childId = vinculo?.criancaId || obterIdCriancaAtual();

  if (!respId || !childId) return;

  try {
    const query = new URLSearchParams({
      responsavelId: String(respId),
      criancaId: String(childId)
    });
    const data = await apiGet(`/api/v1/sync/progress?${query.toString()}`);
    if (data) {
      mesclarProgressoServidor(data, childId);
    }
  } catch (err) {
    console.warn('Falha ao carregar progresso do banco:', err);
  }
}

function chaveHistoriaProgresso(registro) {
  if (!registro) return '';
  const idStr = String(registro.id || registro.Id || '');
  if (!idStr) return '';
  return typeof normalizarIdHistoria === 'function'
    ? String(normalizarIdHistoria(idStr))
    : idStr.replace(/^api-/i, '');
}

function registroProgressoNormalizado(r) {
  const idStr = String(r.id || r.Id || '');
  const idNorm = chaveHistoriaProgresso(r);
  const est = Math.max(0, Math.min(5, Number(r.estrelas || r.Estrelas) || 0));
  let titulo = r.titulo || r.Titulo || '';
  let emoji = r.emoji || r.Emoji || '';
  let genero = r.genero || r.Genero || '';

  if (!titulo && typeof HISTORIAS !== 'undefined') {
    const hFound = HISTORIAS.find(x => {
      const xNorm = typeof normalizarIdHistoria === 'function' ? normalizarIdHistoria(x.id) : String(x.id).replace(/^api-/i, '');
      return String(xNorm) === String(idNorm) || String(x.id) === idStr;
    });
    if (hFound) {
      titulo = hFound.titulo || '';
      emoji = emoji || hFound.emoji || '📖';
      genero = genero || hFound.genero || 'narrativo';
    }
  }

  return {
    id: idNorm ? `api-${idNorm}` : idStr,
    titulo,
    emoji: emoji || '📖',
    genero: genero || 'narrativo',
    estrelas: est,
    data: r.data || r.Data || '',
    dataIso: r.dataIso || r.DataIso || (typeof obterDataIsoHistoria === 'function' ? obterDataIsoHistoria(r) : '') || '',
    timestamp: r.timestamp || r.Timestamp || Date.now()
  };
}

function incorporarHistoriaUnica(mapa, bruto) {
  if (!bruto || (bruto.id == null && bruto.Id == null)) return;
  const chave = chaveHistoriaProgresso(bruto);
  if (!chave) return;
  const novo = registroProgressoNormalizado(bruto);
  const prev = mapa.get(chave);
  if (!prev) {
    mapa.set(chave, novo);
    return;
  }
  prev.estrelas = Math.max(prev.estrelas, novo.estrelas);
  if (!prev.titulo && novo.titulo) prev.titulo = novo.titulo;
  if ((!prev.emoji || prev.emoji === '📖') && novo.emoji) prev.emoji = novo.emoji;
  if (!prev.genero && novo.genero) prev.genero = novo.genero;
  if (!prev.data && novo.data) prev.data = novo.data;
  if (!prev.dataIso && novo.dataIso) prev.dataIso = novo.dataIso;
}

function mesclarProgressoServidor(servidor, criancaIdEsperada) {
  if (!servidor) return;

  const idAtual = Number(criancaIdEsperada || obterIdCriancaAtual());
  if (!idAtual) return;

  if (estado.progressoCriancaId != null && Number(estado.progressoCriancaId) !== idAtual) {
    limparProgressoMemoria();
  }
  estado.progressoCriancaId = idAtual;

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

  const mapa = new Map();
  remoto.forEach((r) => incorporarHistoriaUnica(mapa, r));
  (estado.historiasLidas || []).forEach((r) => incorporarHistoriaUnica(mapa, r));
  estado.historiasLidas = Array.from(mapa.values());
  recalcularTotalEstrelas();

  const atividadeRemota = Array.isArray(servidor.atividadeDiaria)
    ? servidor.atividadeDiaria
    : (Array.isArray(prog.atividadeDiaria)
      ? prog.atividadeDiaria
      : (Array.isArray(servidor.AtividadeDiaria)
        ? servidor.AtividadeDiaria
        : null));

  if (atividadeRemota) {
    const mapaAtv = new Map();
    atividadeRemota.forEach(a => {
      if (!a) return;
      const dt = a.data || a.Data;
      const qtd = Number(a.quantidade || a.Quantidade) || 0;
      if (dt) mapaAtv.set(dt, Math.max(mapaAtv.get(dt) || 0, qtd));
    });
    (estado.atividadeDiaria || []).forEach(a => {
      if (a && a.data) mapaAtv.set(a.data, Math.max(mapaAtv.get(a.data) || 0, Number(a.quantidade) || 0));
    });
    estado.atividadeDiaria = Array.from(mapaAtv.entries()).map(([data, quantidade]) => ({ data, quantidade }));
  }

  const tempoRemoto = servidor.tempoTotal ?? prog.tempoTotal ?? servidor.TempoTotal;
  if (tempoRemoto != null) {
    estado.tempoTotal = Math.max(Number(estado.tempoTotal) || 0, Number(tempoRemoto) || 0);
  }

  const mgJogadosRemoto = resumo.minigamesJogados ?? servidor.minigamesJogados ?? servidor.MinigamesJogados;
  if (mgJogadosRemoto != null) {
    estado.minigamesJogados = Math.max(Number(estado.minigamesJogados) || 0, Number(mgJogadosRemoto) || 0);
  }

  const tentReprovadasRemoto = resumo.tentativasReprovadas ?? servidor.tentativasReprovadas ?? servidor.TentativasReprovadas;
  if (tentReprovadasRemoto != null) {
    estado.tentativasReprovadas = Math.max(Number(estado.tentativasReprovadas) || 0, Number(tentReprovadasRemoto) || 0);
  }

  const acertosRemoto = resumo.acertosMG ?? servidor.acertosMG ?? servidor.AcertosMG;
  if (acertosRemoto != null) {
    estado.acertosMG = Math.max(Number(estado.acertosMG) || 0, Number(acertosRemoto) || 0);
  }

  const errosRemoto = resumo.errosMG ?? servidor.errosMG ?? servidor.ErrosMG;
  if (errosRemoto != null) {
    estado.errosMG = Math.max(Number(estado.errosMG) || 0, Number(errosRemoto) || 0);
  }

  const naoOucoRemoto = resumo.naoConsigoOuvir ?? servidor.naoConsigoOuvir ?? servidor.NaoConsigoOuvir;
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
