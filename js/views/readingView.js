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
    } catch (_) {}
  }

  if (!historia) return;

  estado.historiaAtual = historia;
  estado.faseAtual = 0;
  estado.acertos = 0;
  estado.ajudas = 0;
  estado.iniciouEm = Date.now();

  if (opcoes && opcoes.irLeitura) {
    prepararMinigamesPreset(historia);
    irParaTela('leitura');
    renderizarFase();
    return;
  }

  estado.minigamesPreset = null;
  iniciarMinigames();
}

function obterTextoCompletoHistoria(h) {
  if (!h || !Array.isArray(h.fases)) return '';
  return h.fases.map((f) => f.texto || '').filter(Boolean).join(' ');
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

  ocultarFeedback();

  if (opts.somenteExibir) return;

  if (opts.autoOuvir || estado.perfil.faixa === 1) {
    setTimeout(() => ouvirTexto(textoCompleto), opts.autoOuvir ? 400 : 800);
  }
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
  lerTextoCompletoHistoria({ autoOuvir: estado.perfil.faixa === 1 });

  const n = estado.minigamesLista.length;
  const btn = document.getElementById('btn-continuar');
  btn.textContent = `Vamos Jogar! 🚀 (${n} minigame${n > 1 ? 's' : ''})`;
  btn.style.display = 'block';
}

function renderizarFase() {
  const h = estado.historiaAtual;
  const fi = estado.faseAtual;
  const fase = h.fases[fi];
  const totalFases = h.fases.length;

  setUiLeituraModoCompleto(false);

  document.getElementById('leitura-titulo-badge').textContent = h.titulo;
  document.getElementById('fase-atual-label').textContent = `Fase ${fi + 1}`;

  const dots = document.getElementById('fase-dots');
  dots.innerHTML = '';
  for (let i = 0; i < totalFases; i++) {
    const d = document.createElement('div');
    d.className = 'fase-dot ' + (i < fi ? 'concluida' : i === fi ? 'atual' : '');
    dots.appendChild(d);
  }

  const pct = ((fi) / totalFases * 100);
  document.getElementById('barra-fase-fill').style.width = pct + '%';

  document.getElementById('historia-emoji-cena').textContent = fase.cena || h.cena;

  const textoEl = document.getElementById('historia-texto');
  textoEl.innerHTML = fase.texto;
  textoEl.classList.toggle('sem-destaque', !estado.destaqueAtivo);

  renderizarInteracao(fase.interacao);

  ocultarFeedback();
  document.getElementById('btn-continuar').style.display = 'none';

  if (estado.perfil.faixa === 1) {
    setTimeout(() => ouvirTexto(fase.texto), 800);
  }
}

function renderizarInteracao(inter) {
  const area = document.getElementById('interacao-area');
  area.innerHTML = '';

  if (!inter) return;

  const div = document.createElement('div');

  if (inter.tipo === 'escolha') {
    div.innerHTML = `
      <p class="interacao-pergunta">${inter.pergunta}</p>
      <div class="interacao-opcoes" id="opcoes-container">
        ${inter.opcoes.map((op, i) => `
          <button class="opcao-btn" data-idx="${i}" aria-label="${op}">${op}</button>
        `).join('')}
      </div>
    `;
    area.appendChild(div);
    div.querySelectorAll('.opcao-btn').forEach(btn => {
      btn.addEventListener('click', () => responderEscolha(parseInt(btn.dataset.idx), inter.correta, div));
    });

  } else if (inter.tipo === 'completar') {
    div.innerHTML = `
      <p class="interacao-pergunta">${inter.pergunta}</p>
      <div class="interacao-input-area">
        <input type="text" class="interacao-input" id="input-completar" placeholder="Digite aqui..." autocomplete="off" aria-label="Resposta" />
        <button class="btn-confirmar" id="btn-conf-completar">✓ OK</button>
      </div>
    `;
    area.appendChild(div);
    const inp = document.getElementById('input-completar');
    const conf = document.getElementById('btn-conf-completar');
    const normalizar = str =>
      str.trim().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const verificar = () => {
      const v = normalizar(inp.value);
      const c = normalizar(inter.resposta);
      const ok = v === c || v.includes(c) || c.includes(v);
      responderCompletarFeedback(ok, c, inp, conf);
    };
    conf.addEventListener('click', verificar);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') verificar(); });
  }
}

function responderEscolha(idx, correta, container) {
  const btns = container.querySelectorAll('.opcao-btn');
  btns.forEach(b => b.disabled = true);
  const ok = idx === correta;
  btns[idx].classList.add(ok ? 'correta' : 'errada');
  if (!ok) {
    btns[correta].classList.add('correta');
    estado.ajudas++;
    estado.tentativasReprovadas++;
  } else {
    estado.acertos++;
  }
  adicionarExperiencia(12, 'fase');
  mostrarFeedbackFase(ok);
}

function responderCompletarFeedback(ok, correta, inp, btn) {
  inp.disabled = true;
  btn.disabled = true;
  inp.classList.add(ok ? 'correta' : 'errada');
  if (!ok) {
    inp.value = correta;
    inp.classList.remove('errada');
    inp.classList.add('correta');
    estado.ajudas++;
    estado.tentativasReprovadas++;
  } else {
    estado.acertos++;
  }
  adicionarExperiencia(12, 'fase');
  mostrarFeedbackFase(ok);
}

function mostrarFeedbackFase(ok) {
  const area = document.getElementById('feedback-area');
  const card = document.getElementById('feedback-card');
  const emoji = document.getElementById('feedback-emoji');
  const msg   = document.getElementById('feedback-msg');

  area.classList.remove('oculto');
  if (ok) {
    card.style.background = 'linear-gradient(135deg,#DCFCE7,#D1FAE5)';
    card.style.borderColor = 'var(--cor-verde)';
    emoji.textContent = ['🎉','⭐','🌟','🚀','💫'][Math.floor(Math.random()*5)];
    msg.textContent = MSGS_ACERTO[Math.floor(Math.random()*MSGS_ACERTO.length)];
    msg.style.color = '#166534';
  } else {
    card.style.background = 'linear-gradient(135deg,#FEF3C7,#FDE68A)';
    card.style.borderColor = '#F59E0B';
    emoji.textContent = '💛';
    msg.textContent = MSGS_ERRO[Math.floor(Math.random()*MSGS_ERRO.length)];
    msg.style.color = '#92400E';
  }

  const btn = document.getElementById('btn-continuar');
  btn.textContent = 'Próxima Fase 🚀';
  btn.style.display = 'block';
}

function ocultarFeedback() {
  document.getElementById('feedback-area').classList.add('oculto');
}

function avancarFase() {
  const h = estado.historiaAtual;
  if (estado.faseAtual < h.fases.length - 1) {
    estado.faseAtual++;
    renderizarFase();
  } else {
    iniciarMinigames();
  }
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
      estado.historiasLidas[idx].data = data;
      estado.historiasLidas[idx].dataIso = dataIso;
      salvarEstado();
      atualizarHeader();
      renderizarBiblioteca();
    }
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
