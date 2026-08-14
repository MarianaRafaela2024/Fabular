/* =============================================
   MUNDO DAS HISTÓRIAS — state.js (Model)
   ============================================= */

'use strict';

let estado = {
  perfil: { nome: '', avatar: '🦁', faixa: 1, genero: 'narrativo' },
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

function salvarEstado() {
  const dados = {
    perfil: estado.perfil,
    nivel: estado.nivel,
    totalEstrelas: estado.totalEstrelas,
    historiasLidas: estado.historiasLidas,
    tempoTotal: estado.tempoTotal,
    minigamesJogados: estado.minigamesJogados,
    tentativasReprovadas: estado.tentativasReprovadas,
    acertosMG: estado.acertosMG || 0,
    errosMG: estado.errosMG || 0,
    naoConsigoOuvir: estado.naoConsigoOuvir || 0,
    relatorioEventos: estado.relatorioEventos,
    vidasPerdidas: estado.vidasPerdidas || [],
    vidasPerdidasPorCrianca: estado.vidasPerdidasPorCrianca || {}
  };
  localStorage.setItem('mundoHistorias_estado', JSON.stringify(dados));
  agendarSyncProgresso();
}

function carregarEstado() {
  // Limpa estado de progresso em memória para evitar resquícios de outros perfis
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

  const raw = localStorage.getItem('mundoHistorias_estado');
  if (!raw) return;
  try {
    const dados = JSON.parse(raw);
    const faixaAnterior = dados?.perfil?.faixa;
    Object.assign(estado, dados);
    if (!Array.isArray(estado.vidasPerdidas)) {
      estado.vidasPerdidas = [];
    }
    if (!estado.vidasPerdidasPorCrianca || typeof estado.vidasPerdidasPorCrianca !== 'object') {
      estado.vidasPerdidasPorCrianca = {};
    }
    if (estado.perfil) {
      estado.perfil = normalizarPerfilCrianca(estado.perfil);
      if (estado.perfil.faixa !== faixaAnterior) {
        salvarEstado();
      }
    }
  } catch (e) { /* ignora */ }
}

function garantirContadoresRelatorio() {
  const eventos = estado.relatorioEventos || [];
  if (!eventos.length) return;
  const acertosEventos = eventos.filter(e => e.acao === 'acerto').length;
  const errosEventos = eventos.filter(e => e.acao === 'erro').length;
  const naoOucoEventos = eventos.filter(e => e.acao === 'nao_consigo_ouvir').length;
  estado.acertosMG = Math.max(Number(estado.acertosMG) || 0, acertosEventos);
  estado.errosMG = Math.max(Number(estado.errosMG) || 0, errosEventos);
  estado.naoConsigoOuvir = Math.max(Number(estado.naoConsigoOuvir) || 0, naoOucoEventos);
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
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    enviarSyncProgresso().catch(() => {});
  }, 500);
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
  const remoto = Array.isArray(servidor.historiasLidas) ? servidor.historiasLidas : [];
  const mapa = new Map();

  (estado.historiasLidas || []).forEach((r) => {
    if (!r || r.id == null) return;
    mapa.set(String(r.id), {
      id: String(r.id),
      estrelas: Number(r.estrelas) || 0,
      data: r.data || '',
      dataIso: r.dataIso || obterDataIsoHistoria(r) || ''
    });
  });

  remoto.forEach((r) => {
    if (!r || r.id == null) return;
    const id = String(r.id);
    const atual = mapa.get(id);
    const estrelasRemotas = Math.max(0, Math.min(5, Number(r.estrelas) || 0));
    const estrelasAtuais = Number(atual?.estrelas) || 0;
    const dataRemota = r.data || atual?.data || new Date().toLocaleDateString('pt-BR');
    const dataIsoRemota = r.dataIso || atual?.dataIso || obterDataIsoHistoria({ data: dataRemota }) || '';
    if (!atual || estrelasRemotas >= estrelasAtuais) {
      mapa.set(id, {
        id,
        estrelas: Math.max(estrelasRemotas, estrelasAtuais),
        data: dataRemota,
        dataIso: dataIsoRemota
      });
    }
  });

  estado.historiasLidas = Array.from(mapa.values());
  recalcularTotalEstrelas();

  if (Array.isArray(servidor.atividadeDiaria)) {
    estado.atividadeDiaria = servidor.atividadeDiaria;
  }

  if (servidor.totalEstrelas != null && Number(servidor.totalEstrelas) > 0) {
    estado.totalEstrelas = Math.max(estado.totalEstrelas, Number(servidor.totalEstrelas));
  }
  estado.nivel = calcularNivelPorXp(estado.totalEstrelas);

  if (servidor.tempoTotal != null) {
    estado.tempoTotal = Math.max(Number(estado.tempoTotal) || 0, Number(servidor.tempoTotal) || 0);
  }
  if (servidor.minigamesJogados != null) {
    estado.minigamesJogados = Math.max(Number(estado.minigamesJogados) || 0, Number(servidor.minigamesJogados) || 0);
  }
  if (servidor.tentativasReprovadas != null) {
    estado.tentativasReprovadas = Math.max(Number(estado.tentativasReprovadas) || 0, Number(servidor.tentativasReprovadas) || 0);
  }
  if (servidor.acertosMG != null) {
    estado.acertosMG = Math.max(Number(estado.acertosMG) || 0, Number(servidor.acertosMG) || 0);
  }
  if (servidor.errosMG != null) {
    estado.errosMG = Math.max(Number(estado.errosMG) || 0, Number(servidor.errosMG) || 0);
  }
  if (servidor.naoConsigoOuvir != null) {
    estado.naoConsigoOuvir = Math.max(Number(estado.naoConsigoOuvir) || 0, Number(servidor.naoConsigoOuvir) || 0);
  }

  const dados = {
    perfil: estado.perfil,
    nivel: estado.nivel,
    totalEstrelas: estado.totalEstrelas,
    historiasLidas: estado.historiasLidas,
    tempoTotal: estado.tempoTotal,
    minigamesJogados: estado.minigamesJogados,
    tentativasReprovadas: estado.tentativasReprovadas,
    acertosMG: estado.acertosMG || 0,
    errosMG: estado.errosMG || 0,
    naoConsigoOuvir: estado.naoConsigoOuvir || 0,
    relatorioEventos: estado.relatorioEventos,
    vidasPerdidas: estado.vidasPerdidas || [],
    vidasPerdidasPorCrianca: estado.vidasPerdidasPorCrianca || {}
  };
  localStorage.setItem('mundoHistorias_estado', JSON.stringify(dados));
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
