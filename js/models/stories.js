/* =============================================
   MUNDO DAS HISTÓRIAS — stories.js (Model)
   ============================================= */

'use strict';

const HISTORIAS = [];

const MAPA_IDS_LEGADOS = {
  n1: '1', n2: '2', n3: '3',
  p1: '4', p2: '5',
  i1: '6', i2: '7',
  d1: '8', d2: '9',
  inf1: '10', inf2: '11'
};

function normalizarIdHistoria(id) {
  if (id == null) return '';
  const str = String(id).trim();
  const semApi = str.replace(/^api-/, '');
  if (MAPA_IDS_LEGADOS[semApi]) {
    return MAPA_IDS_LEGADOS[semApi];
  }
  return semApi;
}

const API_BASE = (window.API_BASE_URL || 'http://localhost:5275').replace(/\/$/, '');
const CHAVE_HISTORIAS_CACHE_LEGADO = 'mundoHistorias_historias_ia_cache';

function obterIdCriancaHistorias() {
  if (typeof obterVinculoCrianca === 'function') {
    const v = obterVinculoCrianca();
    if (v?.criancaId) return Number(v.criancaId);
  }
  if (typeof obterIdCriancaAtual === 'function') {
    return obterIdCriancaAtual();
  }
  const id = estado?.perfil?.id || estado?.perfil?.Id;
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function chaveCacheHistoriasIa(criancaId) {
  const id = criancaId || obterIdCriancaHistorias();
  return id ? `mundoHistorias_historias_ia_cache_${id}` : CHAVE_HISTORIAS_CACHE_LEGADO;
}

function ehHistoriaIa(h) {
  if (!h) return false;
  const origem = String(h.origem || '').toLowerCase();
  if (origem === 'ia') return true;
  if (origem === 'manual') return false;
  if (h.criancaId != null && h.criancaId !== '') return true;
  return String(h.id || '').startsWith('local-');
}

function historiaVisivelParaCriancaAtual(h) {
  if (!h) return false;
  if (!ehHistoriaIa(h)) return true;
  const atual = obterIdCriancaHistorias();
  if (!atual) return false;
  const dono = Number(h.criancaId);
  return Number.isFinite(dono) && dono === Number(atual);
}

// ── Cache local de histórias geradas pela IA (por criança) ─────────────────
function salvarHistoriaNoCache(historiaCompleta) {
  try {
    if (!historiaCompleta) return;
    const criancaId = obterIdCriancaHistorias();
    if (ehHistoriaIa(historiaCompleta) && criancaId && (historiaCompleta.criancaId == null || historiaCompleta.criancaId === '')) {
      historiaCompleta.criancaId = criancaId;
      historiaCompleta.origem = 'ia';
    }
    if (!ehHistoriaIa(historiaCompleta) || !historiaVisivelParaCriancaAtual(historiaCompleta)) return;
    const cache = carregarCacheHistorias();
    const idx = cache.findIndex(h => h.id === historiaCompleta.id);
    if (idx >= 0) cache[idx] = historiaCompleta;
    else cache.unshift(historiaCompleta);
    localStorage.setItem(chaveCacheHistoriasIa(criancaId), JSON.stringify(cache.slice(0, 50)));
  } catch (_) { }
}

function carregarCacheHistorias() {
  const criancaId = obterIdCriancaHistorias();
  try {
    const raw = localStorage.getItem(chaveCacheHistoriasIa(criancaId));
    let lista = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) lista = parsed;
    }

    if (criancaId && lista.length === 0) {
      const legado = localStorage.getItem(CHAVE_HISTORIAS_CACHE_LEGADO);
      if (legado) {
        const parsedLegado = JSON.parse(legado);
        if (Array.isArray(parsedLegado)) {
          lista = parsedLegado.filter((h) => Number(h?.criancaId) === Number(criancaId));
        }
      }
    }

    return lista.filter(historiaVisivelParaCriancaAtual);
  } catch (_) {
    return [];
  }
}

function mesclarHistoriasCache() {
  const cache = carregarCacheHistorias();
  if (!cache.length) return;
  cache.forEach(h => {
    if (!h || !h.id || !historiaVisivelParaCriancaAtual(h)) return;
    const existe = HISTORIAS.find(x => x.id === h.id);
    if (!existe) HISTORIAS.unshift(h);
  });
}

async function apiGet(path) {
  const resp = await fetch(`${API_BASE}${path}`);
  if (!resp.ok) throw new Error(`Erro ${resp.status}`);
  return resp.json();
}

async function apiPost(path, body) {
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) throw new Error(`Erro ${resp.status}`);
  return resp.json();
}

function mapStorySummaryToLegacy(story) {
  const criancaId = story.criancaId ?? story.CriancaId ?? null;
  const origem = String(story.origem || story.Origem || '').toLowerCase()
    || (criancaId ? 'ia' : 'manual');
  return {
    id: `api-${story.id}`,
    genero: String(story.genero || 'narrativo').toLowerCase(),
    faixa: story.faixaEtaria || story.FaixaEtaria || 1,
    titulo: story.titulo || story.Titulo || 'História',
    emoji: story.emoji || story.Emoji || '📖',
    cena: story.cena || story.Cena || '🌟',
    duracao: story.duracao || story.Duracao || '5 min',
    origem,
    criancaId: criancaId != null ? Number(criancaId) : null,
    fases: [],
    palavrasChave: []
  };
}

function garantirHistoriaNaBiblioteca(historia) {
  if (!historia || !historia.id) return;
  if (typeof historiaVisivelParaCriancaAtual === 'function' && !historiaVisivelParaCriancaAtual(historia)) return;
  const idx = HISTORIAS.findIndex((h) => h.id === historia.id);
  if (idx >= 0) HISTORIAS[idx] = historia;
  else HISTORIAS.unshift(historia);
}

function preservarDetalheHistoriaNaBiblioteca(id, detalhe) {
  if (detalhe && typeof historiaVisivelParaCriancaAtual === 'function' && !historiaVisivelParaCriancaAtual(detalhe)) {
    return;
  }
  const idx = HISTORIAS.findIndex((h) => h.id === id);
  if (idx < 0) {
    garantirHistoriaNaBiblioteca(detalhe);
    return;
  }
  HISTORIAS[idx] = {
    ...HISTORIAS[idx],
    ...detalhe,
    fases: detalhe.fases || HISTORIAS[idx].fases,
    minigamesPreset: detalhe.minigamesPreset || HISTORIAS[idx].minigamesPreset,
    palavrasChave: detalhe.palavrasChave || HISTORIAS[idx].palavrasChave
  };
}

function historiaApiTemTextoCompleto(h) {
  const texto = h?.fases?.[0]?.texto || h?.textoCompleto || h?.texto || '';
  return texto.length > 0 && !texto.includes('História carregada da API');
}

async function carregarHistoriasDaApi() {
  HISTORIAS.splice(0, HISTORIAS.length);
  mesclarHistoriasCache();
  try {
    const vinculo = obterVinculoCrianca();
    const query = new URLSearchParams();
    if (vinculo?.criancaId) query.set('criancaId', String(vinculo.criancaId));

    const list = await apiGet(`/api/v1/stories?${query.toString()}`);
    if (!Array.isArray(list) || list.length === 0) {
      const soDestaCrianca = HISTORIAS.filter(historiaVisivelParaCriancaAtual);
      HISTORIAS.splice(0, HISTORIAS.length, ...soDestaCrianca);
      return;
    }
    const mapped = list.map(mapStorySummaryToLegacy).filter(historiaVisivelParaCriancaAtual);
    const idsApi = new Set(mapped.map((h) => h.id));
    const detalhadasApi = HISTORIAS.filter((h) =>
      historiaVisivelParaCriancaAtual(h)
      && String(h.id).startsWith('api-')
      && historiaApiTemTextoCompleto(h)
      && idsApi.has(h.id)
    );
    const idsDetalhadas = new Set(detalhadasApi.map((h) => h.id));
    const resumosNovos = mapped.filter((h) => !idsDetalhadas.has(h.id));
    HISTORIAS.splice(0, HISTORIAS.length, ...detalhadasApi, ...resumosNovos);
    mapped.forEach(h => {
      const noCache = carregarCacheHistorias().find(c => c.id === h.id);
      if (noCache && historiaVisivelParaCriancaAtual(noCache)) {
        salvarHistoriaNoCache({ ...noCache, ...h, criancaId: h.criancaId, origem: h.origem });
      }
    });
  } catch (_) {
    const soDestaCrianca = HISTORIAS.filter(historiaVisivelParaCriancaAtual);
    HISTORIAS.splice(0, HISTORIAS.length, ...soDestaCrianca);
  }
}

async function carregarDetalheHistoriaDaApi(id) {
  if (!String(id).startsWith('api-')) return null;
  const serverId = String(id).replace('api-', '');
  const vinculo = obterVinculoCrianca();
  const query = vinculo?.criancaId ? `?criancaId=${encodeURIComponent(vinculo.criancaId)}` : '';
  const data = await apiGet(`/api/v1/stories/${serverId}${query}`);
  const mgRaw = data.minigames != null ? data.minigames : data.Minigames;
  const minigamesPreset = Array.isArray(mgRaw)
    ? mgRaw.map(normalizarMinigamePreset).filter(Boolean)
    : [];
  const texto = data.texto || data.Texto || '';
  const origem = String(data.origem || data.Origem || '').toLowerCase();
  const criancaIdApi = data.criancaId ?? data.CriancaId;
  const naBiblioteca = HISTORIAS.find((h) => h && String(h.id) === `api-${data.id}`);
  return {
    id: `api-${data.id}`,
    genero: String(data.genero || 'narrativo').toLowerCase(),
    faixa: data.faixaEtaria,
    titulo: data.titulo,
    emoji: data.emoji || '📖',
    cena: data.cena || '🌟',
    duracao: data.duracao || '5 min',
    textoCompleto: texto,
    texto: texto,
    fases: texto ? [{ texto, cena: data.cena || '🌟' }] : [],
    palavrasChave: Array.isArray(data.palavrasChave) ? data.palavrasChave : [],
    minigamesPreset,
    origem: origem || naBiblioteca?.origem,
    criancaId: criancaIdApi != null ? Number(criancaIdApi) : (naBiblioteca?.criancaId ?? (origem === 'ia' ? vinculo?.criancaId : null))
  };
}

// Banco de minigames por faixa/gênero
const MINIGAMES_BANCO = {
  narrativo: {
    1: [
      { tipo: 'sequencia', tipoOriginal: 'sequencia', titulo: '📸 Ordene a História!', enunciado: 'Coloque os eventos na ordem certa:' },
      { tipo: 'vf', tipoOriginal: 'vf', titulo: '✅ Verdadeiro ou Falso?', enunciado: 'Sobre a história que você leu, diga se é verdadeiro ou falso:' }
    ],
    2: [
      { tipo: 'montafrase', tipoOriginal: 'montafrase', titulo: '🧩 Monta-Frase!', enunciado: 'Organize as palavras para formar uma frase da história:' },
      { tipo: 'vf', tipoOriginal: 'vf', titulo: '✅ Verdadeiro ou Falso?', enunciado: 'Sobre a história, diga se é verdadeiro ou falso:' }
    ],
    3: [
      { tipo: 'complete', tipoOriginal: 'complete', titulo: '✍️ Complete o Texto!', enunciado: 'Preencha os espaços com as palavras certas:' },
      { tipo: 'mc', tipoOriginal: 'mc', titulo: '🔎 Detetive do Texto', enunciado: 'Responda sobre os detalhes da história:' }
    ]
  },
  poetico: {
    1: [
      { tipo: 'rima', titulo: '🎵 Encontre a Rima!', enunciado: 'Escolha a palavra que rima:' },
      { tipo: 'vf', titulo: '✅ Verdadeiro ou Falso?', enunciado: 'Sobre o poema, diga verdadeiro ou falso:' }
    ],
    2: [
      { tipo: 'rima', titulo: '🎵 Completa o Verso!', enunciado: 'Qual palavra completa a rima?' },
      { tipo: 'mc', titulo: '💬 O Que Significa?', enunciado: 'Qual o significado no poema?' }
    ],
    3: [
      { tipo: 'complete', titulo: '✍️ Complete os Versos!', enunciado: 'Preencha os versos do poema:' },
      { tipo: 'mc', titulo: '🔍 Análise Poética', enunciado: 'Responda sobre os recursos do poema:' }
    ]
  },
  instrucional: {
    1: [
      { tipo: 'sequencia', titulo: '📋 Ordene os Passos!', enunciado: 'Coloque as ações na ordem correta:' },
      { tipo: 'vf', titulo: '✅ Correto ou Errado?', enunciado: 'Essa instrução está correta?' }
    ],
    2: [
      { tipo: 'sequencia', titulo: '📋 Sequência Correta!', enunciado: 'Ordene os passos do procedimento:' },
      { tipo: 'mc', titulo: '🔧 Qual o Material?', enunciado: 'Sobre os materiais e ingredientes:' }
    ],
    3: [
      { tipo: 'complete', titulo: '✍️ Complete as Instruções!', enunciado: 'Preencha os espaços:' },
      { tipo: 'mc', titulo: '⚠️ Por Que Esse Passo?', enunciado: 'Qual a razão desse passo?' }
    ]
  },
  descritivo: {
    1: [
      { tipo: 'mc', titulo: '🎨 Qual a Cor?', enunciado: 'Como o texto descreveu:' },
      { tipo: 'vf', titulo: '✅ Verdadeiro ou Falso?', enunciado: 'Essa descrição está correta?' }
    ],
    2: [
      { tipo: 'mc', titulo: '🔍 Palavras do Cenário', enunciado: 'Qual palavra foi usada para descrever?' },
      { tipo: 'montafrase', titulo: '🧩 Descreva!', enunciado: 'Monte a frase descritiva:' }
    ],
    3: [
      { tipo: 'complete', titulo: '✍️ Complete a Descrição!', enunciado: 'Preencha com as palavras certas:' },
      { tipo: 'mc', titulo: '🔎 Detalhe do Texto', enunciado: 'Qual detalhe foi descrito?' }
    ]
  },
  informativo: {
    1: [
      { tipo: 'vf', titulo: '✅ É Verdade?', enunciado: 'Essa informação é verdadeira?' },
      { tipo: 'mc', titulo: '💡 O Que Você Aprendeu?', enunciado: 'Responda sobre o texto:' }
    ],
    2: [
      { tipo: 'vf', titulo: '✅ Verdadeiro ou Falso?', enunciado: 'Sobre o que você leu:' },
      { tipo: 'mc', titulo: '🔎 Destaque a Informação', enunciado: 'Qual a informação correta?' }
    ],
    3: [
      { tipo: 'complete', titulo: '✍️ Complete as Informações!', enunciado: 'Preencha com dados do texto:' },
      { tipo: 'mc', titulo: '📊 Análise das Informações', enunciado: 'Interprete os dados do texto:' }
    ]
  }
};

const MSGS_ACERTO = [
  'Incrível! Você é demais!',
  'Perfeito! Que resposta esperta!',
  'Muito bem! Continue assim!',
  'Uhuuul! Você acertou!',
  'Fantástico! Você é um leitor(a) nato(a)!'
];
const MSGS_ERRO = [
  'Quase lá! Você está aprendendo muito!',
  'Não tem problema! Continue tentando!',
  'Cada erro nos ensina algo novo! Vamos em frente!'
];
const MSGS_RESULTADO = {
  5: ['Perfeito! 5 estrelas — você é um(a) lenda da leitura!', 'INCRÍVEL! Pontuação máxima! Você arrasou em tudo!'],
  4: ['Quase perfeito! 4 estrelas — muito bem!', 'Excelente! Você só errou um — parabéns!'],
  3: ['Muito bem! 3 estrelas conquistadas!', 'Ótimo trabalho! Continue assim e chegue às 5 estrelas!'],
  2: ['Bom esforço! Continue praticando!', 'Você está melhorando! Tente de novo para mais estrelas!'],
  1: ['Você concluiu! Releia a história e tente de novo!', 'Parabéns por terminar! Pratique mais para subir!'],
  0: ['Não desista! Releia a história e tente novamente!', 'Vamos tentar de novo? Você consegue!']
};

function normalizarTipoMinigame(tipoRaw) {
  const tipo = String(tipoRaw || '').trim().toLowerCase();
  const aliases = {
    jogo_da_memoria: 'jogo_memoria',
    verdadeirofalso: 'verdadeiro_falso',
    vf: 'verdadeiro_falso',
    multipla_escolha: 'escolha',
    multiplaescolha: 'escolha',
    quiz: 'escolha',
    arrastar_passos: 'ordenar_passos',
    ordenar: 'ordenar_passos',
    montafrase: 'monta_frase',
    monta_frase: 'monta_frase',
    palavras_perdidas: 'completar',
    complete: 'completar'
  };
  return aliases[tipo] || tipo || 'verdadeiro_falso';
}

function chaveUnicaMinigame(tipo) {
  const norm = normalizarTipoMinigame(tipo);
  if (norm === 'palavras_perdidas' || norm === 'completar') return 'completar';
  if (norm === 'monta_frase') return 'monta_frase';
  if (norm === 'jogo_memoria') return 'jogo_memoria';
  return norm;
}

function montarListaMinigamesUnica(tipos, genero, faixa) {
  const vistos = new Set();
  const lista = [];
  (tipos || []).forEach((t) => {
    const norm = normalizarTipoMinigame(t);
    const chave = chaveUnicaMinigame(norm);
    if (vistos.has(chave)) return;
    vistos.add(chave);
    lista.push(norm);
  });
  const extras = escolherMinigamesTipos(faixa, genero);
  for (let i = 0; i < extras.length && lista.length < 4; i++) {
    const norm = normalizarTipoMinigame(extras[i]);
    const chave = chaveUnicaMinigame(norm);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    lista.push(norm);
  }
  return lista.slice(0, 4);
}

function extrairPalavrasLista(valor) {
  if (valor == null) return [];
  if (Array.isArray(valor)) {
    return valor.flatMap((item) => extrairPalavrasLista(item));
  }
  const texto = String(valor).trim();
  if (!texto) return [];
  if (texto.startsWith('[')) {
    try {
      const parsed = JSON.parse(texto);
      if (Array.isArray(parsed)) return extrairPalavrasLista(parsed);
    } catch (_) { }
  }
  return texto.split(/\s+/).filter(Boolean);
}

function extrairDadosMontaFrase(spec) {
  const fonte = spec && typeof spec === 'object' ? spec : {};
  const fraseCorreta = String(
    fonte.resposta != null ? fonte.resposta
      : (fonte.frase_correta != null ? fonte.frase_correta
        : (fonte.frase != null ? fonte.frase : ''))
  ).trim();
  let palavrasCorretas = extrairPalavrasLista(fraseCorreta);
  let palavrasPool = extrairPalavrasLista(fonte.palavras);
  if (!palavrasCorretas.length && palavrasPool.length) palavrasCorretas = [...palavrasPool];
  if (!palavrasPool.length && palavrasCorretas.length) palavrasPool = [...palavrasCorretas];
  const norm = (s) => String(s || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  palavrasCorretas.forEach((w) => {
    if (!palavrasPool.some((p) => norm(p) === norm(w))) palavrasPool.push(w);
  });
  return {
    pergunta: fonte.pergunta || '🧩 Monte a frase com as palavras abaixo.',
    palavrasCorretas,
    palavrasPool: palavrasPool.filter(Boolean)
  };
}

function normalizarCorreta(valor) {
  if (typeof valor === 'boolean') return valor ? 0 : 1;
  if (typeof valor === 'number' && Number.isFinite(valor)) return valor;
  const texto = String(valor || '').trim().toLowerCase();
  if (texto === 'verdadeiro' || texto === 'v' || texto === 'true') return 0;
  if (texto === 'falso' || texto === 'f' || texto === 'false') return 1;
  return 0;
}

function normalizarMinigamePreset(minigame) {
  if (!minigame || typeof minigame !== 'object') return null;
  const tipo = normalizarTipoMinigame(minigame.tipo || minigame.Tipo);
  const pergunta = minigame.pergunta || minigame.Pergunta || '';
  const dados = (minigame.dados && typeof minigame.dados === 'object')
    ? minigame.dados
    : (minigame.Dados && typeof minigame.Dados === 'object' ? minigame.Dados : {});
  const fonte = { ...minigame, ...dados };
  const base = { tipo, pergunta };

  if (tipo === 'escolha') {
    base.opcoes = Array.isArray(fonte.opcoes) ? fonte.opcoes.map(String) : [];
    base.correta = normalizarCorreta(fonte.correta);
  } else if (tipo === 'completar' || tipo === 'palavras_perdidas') {
    base.resposta = String(
      fonte.resposta != null ? fonte.resposta
        : (fonte.palavra != null ? fonte.palavra
          : (fonte.lacuna != null ? fonte.lacuna
            : (fonte.correta != null ? fonte.correta : '')))
    ).trim();
    const fraseRaw = fonte.frase || fonte.texto || '';
    base.frase = String(fraseRaw).trim();
    if (fonte.dica != null) base.dica = String(fonte.dica);
  } else if (tipo === 'monta_frase' || tipo === 'palavras_perdidas') {
    const mf = extrairDadosMontaFrase(fonte);
    base.resposta = mf.palavrasCorretas.join(' ');
    base.frase_correta = base.resposta;
    base.palavras = mf.palavrasPool;
    if (pergunta) base.pergunta = pergunta;
  } else if (tipo === 'verdadeiro_falso') {
    base.afirmacao = String(fonte.afirmacao || pergunta || '');
    base.opcoes = Array.isArray(fonte.opcoes) ? fonte.opcoes.map(String) : ['Verdadeiro', 'Falso'];
    base.correta = normalizarCorreta(fonte.correta);
    if (fonte.justificativa != null) base.justificativa = String(fonte.justificativa);
  } else if (tipo === 'jogo_memoria') {
    base.pares = enriquecerParesMemoria(fonte.pares);
  } else if (tipo === 'ligar_pontos') {
    if (Array.isArray(fonte.pares)) {
      base.pares = fonte.pares.map(p => ({
        palavra: String(p.palavra || p.Palavra || p.termo || '').trim(),
        def: String(p.def || p.Definicao || p.definicao || p.dica || '').trim()
      })).filter(p => p.palavra && p.def);
    }
  } else if (tipo === 'som_palavra') {
    base.alvo = fonte.alvo != null ? String(fonte.alvo) : '';
    base.opcoes = Array.isArray(fonte.opcoes) ? fonte.opcoes.map(String) : [];
  } else if (tipo === 'rima') {
    base.palavra = fonte.palavra != null ? String(fonte.palavra) : '';
    base.rima = fonte.rima != null ? String(fonte.rima) : '';
    base.opcoes = Array.isArray(fonte.opcoes) ? fonte.opcoes.map(String) : [];
  } else if (tipo === 'quem_disse') {
    base.fala = String(fonte.fala || fonte.trecho || '');
    base.opcoes = Array.isArray(fonte.opcoes) ? fonte.opcoes.map(String) : [];
    base.correta = normalizarCorreta(fonte.correta);
  } else if (tipo === 'ordenar_passos') {
    base.passos = Array.isArray(fonte.passos) ? fonte.passos.map(String) : [];
  } else if (tipo === 'colorir') {
    base.palavrasAlvo = Array.isArray(fonte.palavrasAlvo) ? fonte.palavrasAlvo.map(String) : [];
    base.distratoras = Array.isArray(fonte.distratoras) ? fonte.distratoras.map(String) : [];
  }

  return base;
}

function extrairJsonTextoGroq(rawText) {
  const limpo = String(rawText || '').replace(/```json|```/gi, '').trim();
  if (!limpo) return '{}';
  const ini = limpo.indexOf('{');
  const fim = limpo.lastIndexOf('}');
  if (ini >= 0 && fim > ini) return limpo.slice(ini, fim + 1);
  return limpo;
}

function garantirMinigamesGroq(minigames, genero, faixa) {
  const lista = Array.isArray(minigames) ? minigames.map(normalizarMinigamePreset).filter(Boolean) : [];
  const tipos = montarListaMinigamesUnica(lista.map((m) => m.tipo), faixa, genero);
  const porChave = {};
  lista.forEach((m) => { porChave[chaveUnicaMinigame(m.tipo)] = m; });
  return tipos.map((tipo) => porChave[chaveUnicaMinigame(tipo)] || { tipo, pergunta: '' });
}

function normalizarStoryGroq(storyRaw, faixaSelecionada, generoSelecionado) {
  const story = (storyRaw && typeof storyRaw === 'object') ? storyRaw : {};
  const generoNormalizado = ['narrativo', 'poetico', 'instrucional', 'descritivo', 'informativo']
    .includes(String(story.genero || '').toLowerCase())
    ? String(story.genero).toLowerCase()
    : generoSelecionado;

  const minigames = garantirMinigamesGroq(story.minigames || story.Minigames, generoNormalizado, faixaSelecionada);
  const texto = String(story.texto || '').trim();
  const titulo = String(story.titulo || '').trim();
  if (!titulo || !texto) {
    throw new Error('A Groq não retornou os campos obrigatórios da história (titulo/texto).');
  }
  if (!minigames.length) {
    throw new Error('A Groq não retornou minigames válidos.');
  }

  return {
    ...story,
    titulo,
    texto,
    genero: generoNormalizado,
    faixaEtaria: faixaSelecionada,
    minigames
  };
}

function mapMinigameGroqParaApi(minigame) {
  if (!minigame || typeof minigame !== 'object') return null;
  const tipo = minigame.tipo || minigame.Tipo;
  if (!tipo) return null;
  const pergunta = minigame.pergunta || minigame.Pergunta || '';
  const dados = {};
  Object.keys(minigame).forEach((chave) => {
    const k = chave.toLowerCase();
    if (k === 'tipo' || k === 'pergunta') return;
    dados[chave] = minigame[chave];
  });
  return { tipo: String(tipo), pergunta: String(pergunta), dados };
}

function montarBodySalvarHistoriaGroq(story, criancaId, prompt, modelo, responsavelId) {
  const minigames = (story.minigames || story.Minigames || [])
    .map(mapMinigameGroqParaApi)
    .filter(Boolean);
  return {
    criancaId,
    promptCrianca: prompt,
    modelo: modelo || 'openai/gpt-oss-120b',
    responsavelId: responsavelId || null,
    story: {
      titulo: story.titulo,
      genero: story.genero,
      faixaEtaria: story.faixaEtaria,
      duracao: story.duracao || '6 min',
      emoji: story.emoji || '📖',
      cena: story.cena || '🌟',
      texto: story.texto,
      palavrasChave: Array.isArray(story.palavrasChave) ? story.palavrasChave : [],
      minigames
    }
  };
}

function mapStoryDetailToLegacy(story, serverId) {
  const minigamesRaw = Array.isArray(story?.minigames)
    ? story.minigames
    : (Array.isArray(story?.Minigames) ? story.Minigames : []);
  const minigamesPreset = minigamesRaw.map(normalizarMinigamePreset).filter(Boolean);
  const idLocal = `local-${btoa(encodeURIComponent((story?.titulo || '') + (story?.genero || ''))).replace(/[^a-z0-9]/gi, '').slice(0, 16)}-${Date.now()}`;
  const idApi = serverId != null ? `api-${serverId}` : idLocal;

  const criancaId = obterIdCriancaHistorias();
  return {
    id: idApi,
    genero: story?.genero || 'narrativo',
    faixa: story?.faixaEtaria || 1,
    titulo: story?.titulo || 'História criada pela IA',
    emoji: story?.emoji || '📖',
    cena: story?.cena || '🌟',
    duracao: story?.duracao || '6 min',
    texto: story?.texto || 'Era uma vez...',
    origem: 'ia',
    criancaId: criancaId,
    fases: [
      {
        texto: story?.texto || 'Era uma vez...',
        cena: story?.cena || '🌟',
        interacao: {
          tipo: 'escolha',
          pergunta: 'Pronto para jogar os minigames?',
          opcoes: ['Sim, vamos!', 'Depois'],
          correta: 0
        }
      }
    ],
    palavrasChave: Array.isArray(story?.palavrasChave) ? story.palavrasChave : [],
    minigamesPreset
  };
}

function faixaParaIdade(faixa) {
  const f = parseInt(faixa, 10) || 1;
  if (f === 1) return 6;
  if (f === 3) return 10;
  return 8;
}

/* =========================================================================
   BANCO CENTRAL DE MINIGAMES
   =========================================================================
   Contém TODOS os 13 minigames disponíveis no sistema.
   Mapeados e separados por Gênero Textual e Faixa Etária (1: 5-6 anos, 2: 7-8 anos, 3: 9-10 anos).
   
   COMO ALTERAR FACILMENTE QUAIS MINIGAMES PODEM SER USADOS:
   Para adicionar, remover ou reordenar minigames de qualquer faixa etária ou gênero,
   basta editar o array correspondente dentro de `REGRAS[genero][faixa]`.
   ========================================================================= */

const BANCO_MINIGAMES = {
  // Lista com TODOS os minigames suportados no sistema
  TODOS: [
    'jogo_memoria',      // 🃏 Jogo da Memória
    'som_palavra',       // 🔊 Som e Palavra
    'monta_frase',       // 🧩 Monta-Frase
    'verdadeiro_falso',  // ✅ Verdadeiro ou Falso?
    'caca_palavras',     // 🔍 Caça-Palavras
    'ligar_pontos',      // 🔗 Ligar os Pontos
    'rima',              // 🎵 Encontre a Rima
    'quem_disse',        // 💬 Quem Disse Isso?
    'ordenar_passos',    // 📋 Ordene os Passos
    'escolha',           // ❓ Escolha Múltipla / Quiz
    'completar',         // ✍️ Completar Frase
    'colorir',           // 🎨 Colorir Palavras
    'palavras_perdidas'  // 🧠 Palavras Perdidas
  ],

  // Mapeamento por Gênero Textual e Faixa Etária (1: 5-6 anos, 2: 7-8 anos, 3: 9-10 anos)
  REGRAS: {
    narrativo: {
      1: ['jogo_memoria', 'som_palavra', 'escolha', 'quem_disse', 'ligar_pontos', 'colorir', 'verdadeiro_falso'],
      2: ['monta_frase', 'verdadeiro_falso', 'completar', 'ordenar_passos', 'caca_palavras', 'jogo_memoria', 'quem_disse', 'palavras_perdidas'],
      3: ['ordenar_passos', 'quem_disse', 'completar', 'verdadeiro_falso', 'caca_palavras', 'monta_frase', 'rima', 'palavras_perdidas', 'jogo_memoria']
    },
    poetico: {
      1: ['som_palavra', 'jogo_memoria', 'rima', 'colorir', 'ligar_pontos', 'escolha', 'verdadeiro_falso'],
      2: ['rima', 'monta_frase', 'verdadeiro_falso', 'completar', 'som_palavra', 'colorir', 'jogo_memoria', 'palavras_perdidas'],
      3: ['rima', 'completar', 'verdadeiro_falso', 'quem_disse', 'monta_frase', 'caca_palavras', 'ordenar_passos', 'palavras_perdidas', 'som_palavra']
    },
    instrucional: {
      1: ['ordenar_passos', 'jogo_memoria', 'escolha', 'verdadeiro_falso', 'ligar_pontos', 'colorir', 'som_palavra'],
      2: ['ordenar_passos', 'verdadeiro_falso', 'caca_palavras', 'monta_frase', 'completar', 'ligar_pontos', 'palavras_perdidas', 'quem_disse'],
      3: ['ordenar_passos', 'caca_palavras', 'completar', 'verdadeiro_falso', 'quem_disse', 'monta_frase', 'rima', 'palavras_perdidas', 'jogo_memoria']
    },
    descritivo: {
      1: ['jogo_memoria', 'som_palavra', 'colorir', 'escolha', 'ligar_pontos', 'verdadeiro_falso', 'rima'],
      2: ['monta_frase', 'caca_palavras', 'verdadeiro_falso', 'completar', 'colorir', 'jogo_memoria', 'palavras_perdidas', 'som_palavra'],
      3: ['caca_palavras', 'quem_disse', 'completar', 'verdadeiro_falso', 'ordenar_passos', 'monta_frase', 'rima', 'palavras_perdidas', 'colorir']
    },
    informativo: {
      1: ['verdadeiro_falso', 'som_palavra', 'escolha', 'colorir', 'jogo_memoria', 'ligar_pontos', 'rima'],
      2: ['verdadeiro_falso', 'caca_palavras', 'completar', 'monta_frase', 'ordenar_passos', 'quem_disse', 'palavras_perdidas', 'som_palavra'],
      3: ['caca_palavras', 'monta_frase', 'completar', 'quem_disse', 'ordenar_passos', 'verdadeiro_falso', 'rima', 'palavras_perdidas', 'colorir']
    }
  }
};

if (typeof window !== 'undefined') {
  window.BANCO_MINIGAMES = BANCO_MINIGAMES;
  window.obterMinigamesAleatoriosDoBanco = obterMinigamesAleatoriosDoBanco;
}

function obterMinigamesAleatoriosDoBanco(faixa, genero, quantidade = 5) {
  const g = String(genero || 'narrativo').trim().toLowerCase();
  const f = Math.min(3, Math.max(1, parseInt(faixa, 10) || 1));

  // Busca opções no banco para aquele gênero e faixa, com fallback para narrativo ou TODOS
  const regrasGenero = BANCO_MINIGAMES.REGRAS[g] || BANCO_MINIGAMES.REGRAS.narrativo;
  const opcoesBanco = (regrasGenero && regrasGenero[f]) || BANCO_MINIGAMES.TODOS;

  // Embaralhar as opções do banco
  const opcoesCopia = [...opcoesBanco];
  for (let i = opcoesCopia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opcoesCopia[i], opcoesCopia[j]] = [opcoesCopia[j], opcoesCopia[i]];
  }

  // Filtrar duplicatas por tipo/chave
  const selecionados = [];
  const chavesVistas = new Set();

  opcoesCopia.forEach((tipoRaw) => {
    const norm = normalizarTipoMinigame(tipoRaw);
    const chave = chaveUnicaMinigame(norm);
    if (!chavesVistas.has(chave) && selecionados.length < quantidade) {
      chavesVistas.add(chave);
      selecionados.push(norm);
    }
  });

  // Completa do pool TODOS se necessário
  if (selecionados.length < quantidade) {
    const todosCopia = [...BANCO_MINIGAMES.TODOS];
    for (let i = todosCopia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [todosCopia[i], todosCopia[j]] = [todosCopia[j], todosCopia[i]];
    }

    todosCopia.forEach((tipoRaw) => {
      const norm = normalizarTipoMinigame(tipoRaw);
      const chave = chaveUnicaMinigame(norm);
      if (!chavesVistas.has(chave) && selecionados.length < quantidade) {
        chavesVistas.add(chave);
        selecionados.push(norm);
      }
    });
  }

  return selecionados.slice(0, quantidade);
}

function escolherMinigamesTipos(faixa, genero) {
  return obterMinigamesAleatoriosDoBanco(faixa, genero, 5);
}


function enriquecerParesMemoria(paresRaw) {
  if (!Array.isArray(paresRaw)) return [];
  return paresRaw
    .map((p) => {
      let palavra = String((p.palavra != null ? p.palavra : p.Palavra) || '').trim();
      palavra = palavra.replace(/\s*\(?par\s*\d+\)?/gi, '').replace(/[\s\-_]+$/, '').trim();
      if (!palavra) return null;
      const emojiEnviado = String((p.emoji != null ? p.emoji : p.Emoji) || '').trim();
      const emojiMapeado = emojiParaPalavra(palavra);
      const usarEnviado = emojiEnviado
        && !EMOJIS_MEMORIA_GENERICOS.has(emojiEnviado)
        && emojiMapeado === '📝';
      return { palavra, emoji: usarEnviado ? emojiEnviado : emojiMapeado };
    })
    .filter(Boolean);
}

const EMOJIS_MEMORIA_GENERICOS = new Set(['⭐', '🌟', '✨', '❓', '🔹', '🔸', '•', '']);

const EMOJI_POR_PALAVRA = {
  leao: '🦁', leoa: '🦁', leoes: '🦁',
  zebra: '🦓', elefante: '🐘', macaco: '🐒', macaca: '🐒',
  gato: '🐱', gata: '🐱', cachorro: '🐶', cachorra: '🐶', cao: '🐶',
  coelho: '🐰', passaro: '🐦', borboleta: '🦋', peixe: '🐟', baleia: '🐋',
  dragao: '🐉', urso: '🐻', ursoa: '🐻', vaca: '🐄', porco: '🐷',
  cavalo: '🐴', ovelha: '🐑', galinha: '🐔', pato: '🦆', sapo: '🐸',
  tartaruga: '🐢', cobra: '🐍', lagarto: '🦎', crocodilo: '🐊',
  sol: '☀️', lua: '🌙', estrela: '⭐', estrelas: '⭐',
  nuvem: '☁️', nuvens: '☁️', chuva: '🌧️', vento: '💨', neve: '❄️',
  arcoiris: '🌈', ceu: '☁️', noite: '🌃', dia: '🌄', manha: '🌅',
  tarde: '🌇', floresta: '🌳', arvore: '🌳', arvores: '🌳', flor: '🌸',
  flores: '🌸', folha: '🍃', folhas: '🍃', grama: '🌿', campo: '🌾',
  mar: '🌊', rio: '🏞️', lago: '🏞️', praia: '🏖️', montanha: '⛰️',
  pedra: '🪨', pedras: '🪨', terra: '🌍', planeta: '🪐',
  casa: '🏠', escola: '🏫', parque: '🏞️', cidade: '🏙️', janela: '🪟',
  livro: '📚', livros: '📚', caderno: '📒', lapis: '✏️', caneta: '🖊️',
  bola: '⚽', brinquedo: '🧸', brinquedos: '🧸', jogo: '🎮', jogos: '🎮',
  comida: '🍽️', pao: '🍞', maca: '🍎', banana: '🍌', bolo: '🎂',
  agua: '💧', leite: '🥛', suco: '🧃',
  amigo: '👫', amiga: '👫', amigos: '👫', amizade: '🤝', familia: '👨‍👩‍👧',
  menina: '👧', menino: '👦', crianca: '🧒', criancas: '🧒',
  mae: '👩', pai: '👨', avo: '👵', avo2: '👴',
  sorriso: '😊', sorrir: '😊', feliz: '😊', alegria: '😄', felicidade: '😄',
  triste: '😢', medo: '😨', coragem: '💪', corajoso: '💪', corajosa: '💪',
  ajuda: '🤝', ajudar: '🤝', cuidado: '💛', carinho: '💛', amor: '❤️',
  parque: '🛝', brincar: '🎈', brincadeira: '🎈', festa: '🎉', celebrar: '🎉',
  correr: '🏃', pular: '🤸', dormir: '😴', cantar: '🎤', dancar: '💃',
  falar: '💬', ouvir: '👂', ver: '👀', olhar: '👀',
  fogo: '🔥', luz: '💡', escuro: '🌑', sombra: '🌑',
  mistério: '🔍', misterio: '🔍', pista: '🔎', pistas: '🔎',
  desafio: '🎯', obstaculo: '🧱', confianca: '🤝', confiar: '🤝',
  investigar: '🕵️', conflito: '⚡', perspectiva: '👁️',
  cooperacao: '🤝', justica: '⚖️', problema: '❗', solucao: '✅',
  segredo: '🤫', janela: '🪟', celular: '📱', foto: '📷', fotografia: '📷',
  desenho: '🖍️', desenhos: '🖍️', cor: '🎨', cores: '🎨', pintar: '🎨',
  vento: '💨', sul: '🧭', bota: '👢', gigante: '🦶',
  baleia: '🐋', farol: '🗼', barco: '⛵', navio: '🚢',
  foguete: '🚀', espaco: '🚀', astronauta: '👨‍🚀',
  hospital: '🏥', medico: '👨‍⚕️', dentista: '🦷',
  bicicleta: '🚲', carro: '🚗', onibus: '🚌', trem: '🚂',
  flor: '🌸', jardim: '🌻', abelha: '🐝', mel: '🍯',
  historia: '📖', conto: '📖', poema: '📝', verso: '📝',
  palavra: '📝', palavras: '📝', leitura: '📖', leitor: '📚',
  estrela: '⭐', planeta: '🪐', universo: '🌌',
  pinguim: '🐧', panda: '🐼', tigre: '🐯', leopardo: '🐆',
  coruja: '🦉', raposa: '🦊', lobo: '🐺', cervo: '🦌',
  girafa: '🦒', hipopotamo: '🦛', rinoceronte: '🦏', camelo: '🐫',
  mosca: '🪰', formiga: '🐜', aranha: '🕷️', joaninha: '🐞',
  cogumelo: '🍄', cacto: '🌵', palmeira: '🌴', pinheiro: '🌲',
  guardiao: '🛡️', biblioteca: '📚', historias: '📖', lembrar: '💭', civilizacao: '🏛️',
  tesouro: '💎', mapa: '🗺️', chave: '🔑', porta: '🚪',
  janela: '🪟', cama: '🛏️', travesseiro: '🛏️', cobertor: '🛏️',
  chapeu: '🎩', sapato: '👟', roupa: '👕', vestido: '👗',
  oculos: '👓', relogio: '⌚', presente: '🎁',
  musica: '🎵', instrumento: '🎸', piano: '🎹', violao: '🎸',
  teatro: '🎭', cinema: '🎬', camera: '📷', televisao: '📺',
  computador: '💻', tablet: '📱', robo: '🤖',
  magia: '✨', fada: '🧚', bruxa: '🧙', princesa: '👸', principe: '🤴',
  castelo: '🏰', rei: '👑', rainha: '👑', coroa: '👑',
  cavaleiro: '🛡️', espada: '⚔️', escudo: '🛡️',
  pirata: '🏴‍☠️', ilha: '🏝️', tesouro: '💰',
  natal: '🎄', pascoa: '🐣', aniversario: '🎂',
  primavera: '🌷', verao: '☀️', outono: '🍂', inverno: '❄️'
};

const EMOJI_CHAVES_ORDENADAS = Object.keys(EMOJI_POR_PALAVRA)
  .sort((a, b) => b.length - a.length);

function emojiParaPalavra(palavra) {
  const norm = normalizarChavePalavra(palavra);
  if (!norm) return '📝';
  if (EMOJI_POR_PALAVRA[norm]) return EMOJI_POR_PALAVRA[norm];
  const tokens = norm.split(/\s+/).filter(Boolean);
  for (const tok of tokens) {
    if (EMOJI_POR_PALAVRA[tok]) return EMOJI_POR_PALAVRA[tok];
  }
  for (const chave of EMOJI_CHAVES_ORDENADAS) {
    if (norm.includes(chave) || chave.includes(norm)) return EMOJI_POR_PALAVRA[chave];
  }
  const sufixos = [
    ['inho', ''], ['inha', ''], ['oes', ''], ['ao', ''], ['oes', ''],
    ['s', ''], ['es', ''], ['ar', ''], ['er', ''], ['ir', ''], ['or', '']
  ];
  for (const [suf, rep] of sufixos) {
    if (norm.length > suf.length + 2 && norm.endsWith(suf)) {
      const raiz = norm.slice(0, -suf.length) + rep;
      if (EMOJI_POR_PALAVRA[raiz]) return EMOJI_POR_PALAVRA[raiz];
    }
  }
  return '📝';
}

function normalizarChavePalavra(palavra) {
  return String(palavra || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim();
}
