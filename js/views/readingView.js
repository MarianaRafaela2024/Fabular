/* =============================================
   MUNDO DAS HISTÓRIAS — readingView.js (View)
   ============================================= */

'use strict';

async function iniciarHistoria(id, opcoes) {
  if (!id) return;
  sessionStorage.setItem('historiaIdDesejada', String(id));

  let historia = HISTORIAS.find((h) => h.id === id);

  if (!historia && typeof carregarCacheHistorias === 'function') {
    const cache = carregarCacheHistorias();
    historia = cache.find((c) => c && c.id === id);
    if (historia && typeof garantirHistoriaNaBiblioteca === 'function') {
      garantirHistoriaNaBiblioteca(historia);
    }
  }

  if (String(id).startsWith('api-') && (!historia || !historiaApiTemTextoCompleto(historia))) {
    try {
      const detalhe = await carregarDetalheHistoriaDaApi(id);
      if (detalhe) {
        historia = detalhe;
        preservarDetalheHistoriaNaBiblioteca(id, detalhe);
        salvarHistoriaNoCache(detalhe);
      }
    } catch (_) { }
  }

  if (!historia) return;

  estado.historiaAtual = historia;
  estado.acertos = 0;
  estado.ajudas = 0;
  estado.iniciouEm = Date.now();

  if (opcoes && opcoes.irLeitura) {
    prepararMinigamesPreset(historia);
    irParaTela('leitura');
    mostrarLeituraCompleta();
    return;
  }

  estado.minigamesPreset = null;
  iniciarMinigames();
}

function obterTextoCompletoHistoria(h) {
  if (!h) return '';
  if (typeof h.textoCompleto === 'string' && h.textoCompleto.trim()) {
    return h.textoCompleto.trim();
  }
  if (typeof h.texto === 'string' && h.texto.trim()) {
    return h.texto.trim();
  }
  if (Array.isArray(h.fases)) {
    return h.fases.map((f) => f.texto || '').filter(Boolean).join(' ');
  }
  return '';
}

function lerTextoCompletoHistoria(opcoes) {
  const opts = opcoes || {};
  const h = estado.historiaAtual;
  if (!h) {
    mostrarToast('Escolha uma história primeiro! 📚');
    return;
  }
  const textoCompleto = obterTextoCompletoHistoria(h);
  if (!textoCompleto.trim()) {
    mostrarToast('Esta história ainda não tem texto para ler.');
    return;
  }

  irParaTela('leitura');
  setUiLeituraModoCompleto(true);

  const badgeEl = document.getElementById('leitura-titulo-badge');
  if (badgeEl) badgeEl.textContent = h.titulo;

  const labelEl = document.getElementById('fase-atual-label');
  if (labelEl) labelEl.textContent = 'História completa';

  const cenaEl = document.getElementById('historia-emoji-cena');
  if (cenaEl) cenaEl.textContent = h.cena || (h.fases && h.fases[0] && h.fases[0].cena) || '📖';

  const textoEl = document.getElementById('historia-texto');
  if (textoEl) {
    textoEl.innerHTML = textoCompleto;
    textoEl.classList.toggle('sem-destaque', !estado.destaqueAtivo);
    textoEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (opts.somenteExibir) return;
}

function setUiLeituraModoCompleto(completo) {
  estado.modoLeituraCompleta = completo;
  const faseInd = document.querySelector('.fase-indicador');
  const barra = document.querySelector('.barra-progresso-fases');
  const inter = document.getElementById('interacao-area');
  const btnPular = document.getElementById('btn-pular-fase');
  if (faseInd) faseInd.style.display = completo ? 'none' : '';
  if (barra) barra.style.display = completo ? 'none' : '';
  if (inter) inter.style.display = completo ? 'none' : '';
  if (btnPular) btnPular.style.display = completo ? 'none' : '';
}

function mostrarLeituraCompleta() {
  const h = estado.historiaAtual;
  if (!h) return;

  estado.modoLeituraCompleta = true;
  lerTextoCompletoHistoria({ autoOuvir: estado.perfil.faixa === 1 });

  const n = (estado.minigamesLista && estado.minigamesLista.length) || 0;
  const btn = document.getElementById('btn-continuar');
  if (btn) {
    btn.textContent = `Vamos Jogar! 🚀 (${n} minigame${n > 1 ? 's' : ''})`;
    btn.style.display = 'block';
  }
}

function renderizarFase() {
  const h = estado.historiaAtual;
  if (!h) return;
  mostrarLeituraCompleta();
}

function avancarFase() {
  iniciarSequenciaMinigames();
}

function pularFase() {
  estado.ajudas += 2;
  avancarFase();
}

function registrarEstrelasHistoria(estrelasNovas) {
  const id = estado.historiaAtual && estado.historiaAtual.id;
  if (!id) return;
  const novas = Math.max(0, Math.min(5, Number(estrelasNovas) || 0));
  if (novas <= 0) return;

  const { data, dataIso } = obterDataConclusaoAtual();
  const idStr = String(id);
  if (!Array.isArray(estado.historiasLidas)) {
    estado.historiasLidas = [];
  }

  const idx = estado.historiasLidas.findIndex(r => r && String(r.id) === idStr);
  if (idx >= 0) {
    estado.historiasLidas[idx].estrelas = Math.max(Number(estado.historiasLidas[idx].estrelas) || 0, novas);
    estado.historiasLidas[idx].data = data || estado.historiasLidas[idx].data;
    estado.historiasLidas[idx].dataIso = dataIso || estado.historiasLidas[idx].dataIso;
  } else {
    estado.historiasLidas.push({
      id: idStr,
      estrelas: novas,
      data,
      dataIso
    });
  }

  if (typeof recalcularTotalEstrelas === 'function') {
    recalcularTotalEstrelas();
  } else {
    estado.totalEstrelas += novas;
  }

  salvarEstado();
  if (typeof enviarSyncProgresso === 'function') enviarSyncProgresso().catch(() => {});
  atualizarHeader();
  renderizarBiblioteca();
}

function atualizarEstrelasAposMinigame() {
  if (!estado.historiaAtual) return;
  const total = estado.minigamesLista.length || 4;
  const acertos = (estado.acertos || 0) + (estado.mgAcertos || 0);
  registrarEstrelasHistoria(calcularEstrelasPorAcertos(acertos, total));
}

// 1 estrela por minigame acertado (máximo de 5)
function calcularEstrelasPorAcertos(acertos, total) {
  const a = Math.max(0, Number(acertos) || 0);
  const t = Math.max(1, Number(total) || 1);
  // Cada minigame vale 1 estrela — acertou todos os t, ganha t estrelas (max 5)
  return Math.min(5, a);
}
