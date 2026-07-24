/* =============================================
   MUNDO DAS HISTÓRIAS — state.js (Model)
   ============================================= */

'use strict';

let estado = {
  perfil: { nome: '', avatar: '🦁', faixa: 1, genero: 'narrativo' },
  nivel: 'iniciante', // iniciante | intermediario | avancado
  experiencia: 0,
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
  relatorioEventos: [] // eventos locais por minigame
};

let syncTimer = null;

const FAIXAS_NIVEL_XP = [
  { id: 'iniciante', min: 0, max: 100 },
  { id: 'intermediario', min: 100, max: 280 },
  { id: 'avancado', min: 280, max: 450 }
];

function salvarEstado() {
  const dados = {
    perfil: estado.perfil,
    nivel: estado.nivel,
    experiencia: estado.experiencia || 0,
    totalEstrelas: estado.totalEstrelas,
    historiasLidas: estado.historiasLidas,
    tempoTotal: estado.tempoTotal,
    minigamesJogados: estado.minigamesJogados,
    tentativasReprovadas: estado.tentativasReprovadas,
    acertosMG: estado.acertosMG || 0,
    errosMG: estado.errosMG || 0,
    naoConsigoOuvir: estado.naoConsigoOuvir || 0,
    relatorioEventos: estado.relatorioEventos
  };
  localStorage.setItem('mundoHistorias_estado', JSON.stringify(dados));
  agendarSyncProgresso();
}

function carregarEstado() {
  const raw = localStorage.getItem('mundoHistorias_estado');
  if (!raw) return;
  try {
    const dados = JSON.parse(raw);
    Object.assign(estado, dados);
    garantirContadoresRelatorio();
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
    const localChildKey = estado?.perfil?.localChildKey;
    if (!localChildKey) return null;
    const vinculos = JSON.parse(localStorage.getItem(CHAVE_VINCULOS) || '{}');
    return vinculos[localChildKey] || null;
  } catch (_) {
    return null;
  }
}

function obterResponsavelId() {
  try {
    const sessao = JSON.parse(localStorage.getItem('mundoHistorias_responsavel_sessao') || 'null');
    return sessao?.responsavelId || null;
  } catch (_) {
    return null;
  }
}

function agendarSyncProgresso() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    enviarSyncProgresso().catch(() => {});
  }, 800);
}

async function enviarSyncProgresso() {
  const sessao = (() => {
    try { return JSON.parse(localStorage.getItem('mundoHistorias_responsavel_sessao') || 'null'); } catch (_) { return null; }
  })();
  const vinculo = obterVinculoCrianca();
  if (!sessao?.responsavelId || !vinculo?.criancaId) return;

  await apiPost('/api/v1/sync/progress', {
    responsavelId: sessao.responsavelId,
    criancaId: vinculo.criancaId,
    faixaEtaria: estado.perfil.faixa,
    progressoHistorias: {
      totalEstrelas: estado.totalEstrelas,
      historiasLidas: estado.historiasLidas,
      tempoTotal: estado.tempoTotal
    },
    resumoMinigames: {
      minigamesJogados: estado.minigamesJogados,
      tentativasReprovadas: estado.tentativasReprovadas,
      acertosMG: estado.acertosMG || 0,
      errosMG: estado.errosMG || 0,
      naoConsigoOuvir: estado.naoConsigoOuvir || 0
    },
    updatedAt: new Date().toISOString()
  });
}

async function carregarProgressoDoServidor() {
  const sessao = (() => {
    try { return JSON.parse(localStorage.getItem('mundoHistorias_responsavel_sessao') || 'null'); } catch (_) { return null; }
  })();
  const vinculo = obterVinculoCrianca();
  if (!sessao?.responsavelId || !vinculo?.criancaId) return;

  try {
    const query = new URLSearchParams({
      responsavelId: String(sessao.responsavelId),
      criancaId: String(vinculo.criancaId)
    });
    const data = await apiGet(`/api/v1/sync/progress?${query.toString()}`);
    mesclarProgressoServidor(data);
  } catch (_) {
    // Mantém progresso local se a API estiver indisponível.
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
    const estrelasRemotas = Math.max(0, Math.min(3, Number(r.estrelas) || 0));
    const estrelasAtuais = Number(atual?.estrelas) || 0;
    const dataRemota = r.data || atual?.data || new Date().toLocaleDateString('pt-BR');
    const dataIsoRemota = r.dataIso || atual?.dataIso || obterDataIsoHistoria({ data: dataRemota }) || '';
    if (!atual || estrelasRemotas > estrelasAtuais) {
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
    experiencia: estado.experiencia || 0,
    totalEstrelas: estado.totalEstrelas,
    historiasLidas: estado.historiasLidas,
    tempoTotal: estado.tempoTotal,
    minigamesJogados: estado.minigamesJogados,
    tentativasReprovadas: estado.tentativasReprovadas,
    acertosMG: estado.acertosMG || 0,
    errosMG: estado.errosMG || 0,
    naoConsigoOuvir: estado.naoConsigoOuvir || 0,
    relatorioEventos: estado.relatorioEventos
  };
  localStorage.setItem('mundoHistorias_estado', JSON.stringify(dados));
}

function recalcularTotalEstrelas() {
  estado.totalEstrelas = (estado.historiasLidas || []).reduce(
    (soma, r) => soma + (Number(r.estrelas) || 0),
    0
  );
}

function calcularNivelPorXp(xp) {
  const x = Math.max(0, Number(xp) || 0);
  if (x >= 280) return 'avancado';
  if (x >= 100) return 'intermediario';
  return 'iniciante';
}

function obterFaixaXpAtual(xp) {
  const nivel = calcularNivelPorXp(xp);
  return FAIXAS_NIVEL_XP.find((f) => f.id === nivel) || FAIXAS_NIVEL_XP[0];
}

function adicionarExperiencia(quantidade, motivo) {
  const ganho = Math.max(0, Number(quantidade) || 0);
  if (!ganho) return;
  const antes = estado.experiencia || 0;
  const nivelAntes = calcularNivelPorXp(antes);
  estado.experiencia = antes + ganho;
  const nivelDepois = calcularNivelPorXp(estado.experiencia);
  estado.nivel = nivelDepois;
  salvarEstado();
  atualizarHeader();
  atualizarBarraExperiencia();
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
