/* =============================================
   MUNDO DAS HISTÓRIAS — readingView.js (View)
   ============================================= */

'use strict';

async function iniciarHistoria(id, opcoes) {
  let historia = HISTORIAS.find((h) => h.id === id);

  if (String(id).startsWith('api-')) {
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
  document.getElementById('leitura-titulo-badge').textContent = h.titulo;
  document.getElementById('fase-atual-label').textContent = 'História completa';
  document.getElementById('historia-emoji-cena').textContent = h.cena || (h.fases[0] && h.fases[0].cena) || '';

  const textoEl = document.getElementById('historia-texto');
  textoEl.innerHTML = textoCompleto;
  textoEl.classList.toggle('sem-destaque', !estado.destaqueAtivo);
  textoEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

  const n = estado.minigamesLista.length;
  const btn = document.getElementById('btn-continuar');
  btn.textContent = `Vamos Jogar! 🚀 (${n} minigame${n > 1 ? 's' : ''})`;
  btn.style.display = 'block';
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
  const novas = Math.max(0, Math.min(3, Number(estrelasNovas) || 0));
  const { data, dataIso } = obterDataConclusaoAtual();
  const idx = estado.historiasLidas.findIndex(r => r.id === id);

  if (idx >= 0) {
    const antigas = Number(estado.historiasLidas[idx].estrelas) || 0;
    if (novas > antigas) {
      estado.totalEstrelas += novas - antigas;
      estado.historiasLidas[idx].estrelas = novas;
    }
    estado.historiasLidas[idx].data = data;
    estado.historiasLidas[idx].dataIso = dataIso;
    salvarEstado();
    atualizarHeader();
    renderizarBiblioteca();
  } else if (novas > 0) {
    estado.historiasLidas.push({
      id,
      estrelas: novas,
      data,
      dataIso
    });
    estado.totalEstrelas += novas;
    salvarEstado();
    atualizarHeader();
    renderizarBiblioteca();
  }
}

function atualizarEstrelasAposMinigame() {
  if (!estado.historiaAtual) return;
  const total = estado.minigamesLista.length || 4;
  const acertos = (estado.acertos || 0) + (estado.mgAcertos || 0);
  registrarEstrelasHistoria(calcularEstrelasPorAcertos(acertos, total));
}

function calcularEstrelasPorAcertos(acertos, total) {
  const a = Math.max(0, Number(acertos) || 0);
  const t = Math.max(1, Number(total) || 1);
  if (a >= t) return 3;
  if (a >= Math.ceil(t * 0.5)) return 2;
  if (a >= 1) return 1;
  return 0;
}
