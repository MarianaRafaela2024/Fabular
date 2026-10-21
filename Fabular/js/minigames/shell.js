/* =============================================
   Fabular — casca compartilhada dos minigames
   ============================================= */
'use strict';

const MG_CLEANUPS = [];

const MG_NOMES = {
  jogo_memoria: 'Jogo da Memória',
  som_palavra: 'Som e Palavra',
  monta_frase: 'Monta-Frase',
  verdadeiro_falso: 'Verdadeiro ou Falso',
  caca_palavras: 'Caça-Palavras',
  ligar_pontos: 'Ligar os Pontos',
  rima: 'Encontre a Rima',
  quem_disse: 'Quem Disse Isso?',
  ordenar_passos: 'Ordene os Passos',
  escolha: 'Escolha Múltipla',
  completar: 'Completar',
  colorir: 'Colorir Palavras',
  palavras_perdidas: 'Palavras Perdidas'
};

const MG_CONFIG_FAIXA = {
  1: { paresMemoria: 3, opcoes: 2, palavrasCaca: 3, passos: 3 },
  2: { paresMemoria: 3, opcoes: 3, palavrasCaca: 4, passos: 4 },
  3: { paresMemoria: 4, opcoes: 4, palavrasCaca: 4, passos: 4 }
};

function escapeHtmlMG(valor) {
  return String(valor == null ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function faixaMinigameAtual() {
  const h = typeof estado !== 'undefined' ? estado.historiaAtual : null;
  const raw = h?.faixa ?? h?.faixaEtaria ?? h?.FaixaEtaria ?? (estado?.perfil?.faixa);
  const f = parseInt(raw, 10);
  return (f === 2 || f === 3) ? f : 1;
}

function configFaixaMinigame() {
  return MG_CONFIG_FAIXA[faixaMinigameAtual()] || MG_CONFIG_FAIXA[1];
}

function nomeMinigamePadrao(tipo) {
  const norm = typeof normalizarTipoMinigame === 'function' ? normalizarTipoMinigame(tipo) : String(tipo || '');
  return MG_NOMES[norm] || MG_NOMES[tipo] || String(tipo || 'Minigame');
}

function registrarCleanupMG(fn) {
  if (typeof fn === 'function') MG_CLEANUPS.push(fn);
}

function limparMinigameAtivo() {
  while (MG_CLEANUPS.length) {
    const fn = MG_CLEANUPS.pop();
    try { fn(); } catch (_) { /* ignore */ }
  }
}

function iniciarSessaoResultados() {
  if (typeof estado === 'undefined') return;
  estado.mgSessaoResultados = [];
  estado.mgReplayErros = false;
}

function registrarResultadoMinigame(tipo, acertou) {
  if (typeof estado === 'undefined') return;
  if (!Array.isArray(estado.mgSessaoResultados)) estado.mgSessaoResultados = [];
  const idx = estado.minigameAtual || 0;
  estado.mgSessaoResultados[idx] = {
    tipo: typeof normalizarTipoMinigame === 'function' ? normalizarTipoMinigame(tipo) : tipo,
    nome: nomeMinigamePadrao(tipo),
    acertou: !!acertou
  };
}

function atualizarBarraProgressoMG() {
  const fill = document.getElementById('mg-progresso-fill');
  const contador = document.getElementById('mg-contador');
  const total = (estado.minigamesLista && estado.minigamesLista.length) || 5;
  const atual = Math.min(total, (estado.minigameAtual || 0) + 1);
  if (fill) fill.style.width = `${Math.round((atual / total) * 100)}%`;
  if (contador) contador.textContent = `${atual} / ${total}`;
}

function travarAreaMinigame(corpo) {
  const area = corpo || document.getElementById('minigame-corpo');
  if (!area) return;
  area.querySelectorAll('button, input, textarea').forEach((el) => {
    if (el.id === 'btn-proximo-mg' || el.id === 'btn-finalizar-mg') return;
    el.disabled = true;
  });
}
