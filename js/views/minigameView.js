/* =============================================
   MUNDO DAS HISTÓRIAS — minigameView.js (View)
   ============================================= */

'use strict';

function iniciarMinigames() {
  const h = estado.historiaAtual;
  prepararMinigamesPreset(h);
  estado.minigameAtual = 0;
  estado.mgAcertos = 0;
  mostrarLeituraCompleta();
}

function iniciarSequenciaMinigames() {
  irParaTela('minigame');
  renderizarMinigame();
}

function nomeMinigame(tipo) {
  const nomes = {
    memoria:         '🃏 Jogo da Memória',
    jogo_memoria:    '🃏 Jogo da Memória',
    som_palavra:     '🔊 Som e Palavra',
    monta_frase:     '🧩 Monta-Frase',
    verdadeiro_falso:'✅ Verdadeiro ou Falso?',
    caca_palavras:   '🔍 Caça-Palavras',
    ligar_pontos:    '🔗 Ligar os Pontos',
    rima:            '🎵 Encontre a Rima',
    quem_disse:      '💬 Quem Disse Isso?',
    ordenar_passos:  '📋 Ordene os Passos',
    escolha:         '❓ Escolha Múltipla',
    completar:       '✍️ Completar',
    colorir:         '🎨 Colorir Palavras',
    palavras_perdidas:'🧠 Palavras Perdidas'
  };
  return nomes[tipo] || tipo;
}

function renderizarMinigame() {
  const spec =
    estado.minigamesPreset && estado.minigamesPreset[estado.minigameAtual]
      ? estado.minigamesPreset[estado.minigameAtual]
      : null;
  const tipo =
    normalizarTipoMinigame((spec && (spec.tipo || spec.Tipo)) || estado.minigamesLista[estado.minigameAtual]);
  const total = estado.minigamesLista.length;
  const h     = estado.historiaAtual;
  const fase  = h.fases[Math.min(estado.faseAtual, h.fases.length - 1)];

  document.getElementById('mg-titulo-label').textContent = nomeMinigame(tipo);
  document.getElementById('mg-contador').textContent     = `${estado.minigameAtual + 1} / ${total}`;

  document.getElementById('mg-feedback').classList.add('oculto');
  document.getElementById('btn-proximo-mg').classList.add('oculto');
  document.getElementById('btn-finalizar-mg').classList.add('oculto');

  const corpo = document.getElementById('minigame-corpo');
  corpo.innerHTML = '';

  const tiposSemEnunciadoDuplicado = ['completar', 'palavras_perdidas', 'escolha', 'verdadeiro_falso', 'som_palavra', 'rima', 'quem_disse'];
  if (!tiposSemEnunciadoDuplicado.includes(tipo)) {
    const header = document.createElement('div');
    header.className = 'mg-enunciado';
    header.textContent = nomeMinigame(tipo);
    corpo.appendChild(header);
  }

  switch (tipo) {
    case 'memoria':
    case 'jogo_memoria':     renderMemoria(fase, h, corpo, spec);           break;
    case 'som_palavra':      renderSomPalavra(fase, corpo, spec);            break;
    case 'monta_frase':      renderMontaFrase(fase, corpo, spec);           break;
    case 'verdadeiro_falso': renderVerdadeiroFalso(fase, h, corpo, spec);   break;
    case 'caca_palavras':    renderCacaPalavras(fase, h, corpo);            break;
    case 'ligar_pontos':     renderLigarPontos(fase, h, corpo);             break;
    case 'rima':             renderRima(h, corpo, spec);                    break;
    case 'quem_disse':       renderQuemDisse(fase, h, corpo, spec);         break;
    case 'ordenar_passos':   renderOrdenarPassos(h, corpo, spec);           break;
    case 'escolha':          renderEscolhaMG(fase, corpo, spec);            break;
    case 'completar':        renderCompletarMG(fase, corpo, spec);          break;
    case 'colorir':          renderColorirMG(h, corpo, spec);               break;
    case 'palavras_perdidas':renderCompletarMG(fase, corpo, spec || { tipo: 'completar' }); break;
    default:                 renderVerdadeiroFalso(fase, h, corpo, spec);
  }
}

function mostrarFeedbackMG(ok, mostrarProximo = true) {
  if (ok) estado.mgAcertos++;
  else estado.tentativasReprovadas++;

  const area  = document.getElementById('mg-feedback');
  const card  = document.getElementById('mg-feedback-card');
  const emoji = document.getElementById('mg-feedback-emoji');
  const msg   = document.getElementById('mg-feedback-msg');

  area.classList.remove('oculto');

  if (ok) {
    card.style.background  = 'linear-gradient(135deg,#DCFCE7,#D1FAE5)';
    card.style.borderColor = 'var(--cor-verde)';
    emoji.textContent      = ['🎉','🌟','🏆','💫','🚀'][Math.floor(Math.random()*5)];
    msg.textContent        = MSGS_ACERTO[Math.floor(Math.random()*MSGS_ACERTO.length)];
    msg.style.color        = '#166534';
  } else {
    card.style.background  = 'linear-gradient(135deg,#FEF3C7,#FDE68A)';
    card.style.borderColor = '#F59E0B';
    emoji.textContent      = '💛';
    msg.textContent        = MSGS_ERRO[Math.floor(Math.random()*MSGS_ERRO.length)];
    msg.style.color        = '#92400E';
  }

  if (ok) {
    adicionarExperiencia(18, 'fase');
  }

  if (mostrarProximo) {
    const isUltimo = estado.minigameAtual >= estado.minigamesLista.length - 1;
    const btnProx  = document.getElementById('btn-proximo-mg');
    const btnFin   = document.getElementById('btn-finalizar-mg');
    btnProx.classList.toggle('oculto',  isUltimo);
    btnFin.classList.toggle('oculto',  !isUltimo);
    if (isUltimo) btnFin.textContent = 'Ver Resultado 🏆';
    else          btnProx.textContent = 'Próximo Jogo →';
  }

  area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function proximoMinigame() {
  estado.minigameAtual++;
  renderizarMinigame();
  document.getElementById('app-main').scrollTop = 0;
}

function finalizarMinigames() {
  const tempoMin = Math.max(1, Math.round((Date.now() - (estado.iniciouEm || Date.now())) / 60000));
  estado.tempoTotal += tempoMin;
  estado.minigamesJogados += estado.minigamesLista.length;

  const acertosTotal = (estado.acertos || 0) + (estado.mgAcertos || 0);
  const totalJogos   = estado.minigamesLista.length || 4;
  const estrelas     = calcularEstrelasPorAcertos(acertosTotal, totalJogos);

  registrarEstrelasHistoria(estrelas);
  const id = estado.historiaAtual.id;
  const idx = estado.historiasLidas.findIndex(r => r.id === id);
  if (idx >= 0) {
    const { data, dataIso } = obterDataConclusaoAtual();
    estado.historiasLidas[idx].data = data;
    estado.historiasLidas[idx].dataIso = dataIso;
  }

  adicionarExperiencia(28, 'historia');
  estado.nivel = calcularNivelPorXp(estado.experiencia || 0);

  salvarEstado();
  atualizarHeader();
  renderizarBiblioteca();
  mostrarResultado(estrelas, tempoMin, acertosTotal);
}

function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizarChavePalavra(palavra) {
  return String(palavra || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim();
}

function prepararMinigamesPreset(h) {
  const presetSrc = Array.isArray(h.minigamesPreset) ? h.minigamesPreset : [];
  if (presetSrc.length) {
    let preset = embaralhar(
      presetSrc.map((p) => normalizarMinigamePreset(p) || p).filter(Boolean)
    );
    const vistos = new Set();
    preset = preset.filter((p) => {
      const chave = chaveUnicaMinigame(p.tipo);
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });
    if (preset.length < 4) {
      const extras = escolherMinigamesTipos(estado.perfil.faixa, h.genero);
      for (let i = 0; i < extras.length && preset.length < 4; i++) {
        const chave = chaveUnicaMinigame(extras[i]);
        if (vistos.has(chave)) continue;
        vistos.add(chave);
        preset.push({ tipo: extras[i], pergunta: '' });
      }
    }
    preset = preset.slice(0, 4);
    estado.minigamesLista = montarListaMinigamesUnica(
      preset.map((p) => p.tipo),
      estado.perfil.faixa,
      h.genero
    );
    const presetPorChave = {};
    preset.forEach((p) => { presetPorChave[chaveUnicaMinigame(p.tipo)] = p; });
    estado.minigamesPreset = estado.minigamesLista.map((tipo) =>
      presetPorChave[chaveUnicaMinigame(tipo)] || { tipo, pergunta: '' }
    );
  } else {
    estado.minigamesPreset = null;
    const tiposBase = escolherMinigamesTipos(estado.perfil.faixa, h.genero);
    estado.minigamesLista = montarListaMinigamesUnica(
      embaralhar(tiposBase),
      estado.perfil.faixa,
      h.genero
    );
  }
}

function registrarEventoMG(tipo, acao, dados) {
  estado.relatorioEventos.push({
    tipo: tipo,
    acao: acao,
    dados: dados || null,
    historiaId: estado.historiaAtual ? estado.historiaAtual.id : null,
    em: new Date().toISOString()
  });
  if (acao === 'acerto') estado.acertosMG = (Number(estado.acertosMG) || 0) + 1;
  else if (acao === 'erro') estado.errosMG = (Number(estado.errosMG) || 0) + 1;
  else if (acao === 'nao_consigo_ouvir') estado.naoConsigoOuvir = (Number(estado.naoConsigoOuvir) || 0) + 1;
  if (estado.relatorioEventos.length > 400) {
    estado.relatorioEventos = estado.relatorioEventos.slice(-400);
  }
  salvarEstado();
}

function revelarMontaFraseCorreta(palavrasCorretas) {
  const espaco = document.getElementById('mfEspaco');
  const pool = document.getElementById('mfPool');
  if (espaco) {
    espaco.innerHTML = palavrasCorretas.map(p =>
      `<span class="mf-colocada mf-resposta-correta">${p}</span>`
    ).join(' ');
  }
  if (pool) pool.querySelectorAll('.mf-chip, .mf-colocada').forEach(b => { b.disabled = true; });
}

function textoValidoCompletar(texto) {
  const t = String(texto || '').trim();
  if (!t) return false;
  if (/^[-–—_\s.]+$/u.test(t)) return false;
  if (/^complete(\s+a\s+frase)?[:.]?\s*$/i.test(t)) return false;
  return true;
}

function limparTextoCompletar(texto) {
  return String(texto || '')
    .replace(/^✍️\s*/u, '')
    .replace(/^Complete:\s*/i, '')
    .replace(/^Complete a frase[^:]*:\s*/i, '')
    .replace(/\s*[-–—]{2,}\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function montarDadosCompletarMG(fase, h, spec) {
  const fonte = spec && typeof spec === 'object' ? spec : {};
  let resposta = String(
    fonte.resposta != null ? fonte.resposta
      : (fonte.palavra != null ? fonte.palavra
        : (fonte.lacuna != null ? fonte.lacuna : ''))
  ).trim();
  let frase = '';
  if (textoValidoCompletar(fonte.frase)) frase = limparTextoCompletar(fonte.frase);
  else if (textoValidoCompletar(fonte.texto)) frase = limparTextoCompletar(fonte.texto);

  const inter = fase && fase.interacao && fase.interacao.tipo === 'completar' ? fase.interacao : null;
  if (!resposta && inter) resposta = String(inter.resposta || '').trim();
  if (!frase && inter && textoValidoCompletar(inter.pergunta)) {
    frase = limparTextoCompletar(inter.pergunta);
  }

  if (!resposta && h) {
    const kw = (h.palavrasChave || []).find(Boolean) || 'história';
    resposta = kw;
    const textoLimpo = (fase && fase.texto ? fase.texto : h.fases[0]?.texto || '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const fraseTxt = textoLimpo.split(/[.!?]/).map((s) => s.trim()).find((s) => s.length > 12) || textoLimpo;
    const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(fraseTxt)) frase = fraseTxt.replace(re, '___');
    else frase = (fraseTxt.length > 80 ? fraseTxt.slice(0, 80) + '…' : fraseTxt) + ' ___';
  }

  if (frase && resposta && !/_{2,}|___/.test(frase)) {
    const reResp = new RegExp(`\\b${resposta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (reResp.test(frase)) frase = frase.replace(reResp, '___');
    else frase = frase + ' ___';
  }

  if (!frase) frase = 'Complete a frase ___';

  let instrucao = 'Leia a frase e escreva uma palavra para completar.';
  const perguntaSpec = limparTextoCompletar(fonte.pergunta || '');
  if (textoValidoCompletar(perguntaSpec) && !/_{2,}|___/.test(perguntaSpec) && perguntaSpec !== frase) {
    instrucao = perguntaSpec;
  }

  return {
    frase,
    instrucao,
    resposta: resposta || 'palavra',
    dica: fonte.dica || (inter && inter.dica) || ''
  };
}

function formatarFraseLacunaHtml(frase) {
  const limpa = limparTextoCompletar(String(frase || '').replace(/<[^>]+>/g, ''));
  return limpa.replace(/_{2,}|___/g, '<span class="lacuna-vazia" aria-hidden="true">_____</span>');
}

// ─── 1. JOGO DA MEMÓRIA ──────────────────────────────────────────────────────
function renderMemoria(fase, h, corpo, spec) {
  let pares;
  if (spec && Array.isArray(spec.pares) && spec.pares.length >= 2) {
    pares = enriquecerParesMemoria(spec.pares).map((p, i) => ({ id: i, ...p }));
  }
  if (!pares || pares.length < 2) {
    const palavras = (h.palavrasChave || []).slice(0, 5);
    if (palavras.length < 2) { renderVerdadeiroFalso(fase, h, corpo, null); return; }
    pares = palavras.map((p, i) => ({
      id: i,
      palavra: p,
      emoji: emojiParaPalavra(p)
    }));
  }

  const cards = embaralhar([
    ...pares.map(p => ({ tipo: 'palavra', valor: p.palavra, pairId: p.id })),
    ...pares.map(p => ({ tipo: 'emoji',   valor: p.emoji,   pairId: p.id }))
  ]);

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <p class="mg-desc">Encontre os pares! Clique nos cards para virá-los e encontrar a palavra com seu emoji! 🃏</p>
    <div class="mem-grid" id="memGrid"></div>
    <div class="mem-status" id="memStatus">Pares encontrados: <strong id="memPares">0</strong> / ${pares.length}</div>
  `;
  corpo.appendChild(wrap);

  const grid = document.getElementById('memGrid');
  let virados = [];
  let paresEncontrados = 0;
  let bloqueado = false;

  cards.forEach((card, idx) => {
    const el = document.createElement('div');
    el.className = 'mem-card';
    el.dataset.idx = idx;
    el.dataset.pairId = card.pairId;
    el.dataset.tipo = card.tipo;
    el.innerHTML = `
      <div class="mem-inner">
        <div class="mem-frente">?</div>
        <div class="mem-verso">${card.valor}</div>
      </div>
    `;
    el.addEventListener('click', () => {
      if (bloqueado) return;
      if (el.classList.contains('mem-virado') || el.classList.contains('mem-acertado')) return;

      el.classList.add('mem-virado');
      virados.push({ el, card });

      if (virados.length === 2) {
        bloqueado = true;
        const [a, b] = virados;
        if (a.card.pairId === b.card.pairId && a.card.tipo !== b.card.tipo) {
          setTimeout(() => {
            a.el.classList.add('mem-acertado');
            b.el.classList.add('mem-acertado');
            paresEncontrados++;
            document.getElementById('memPares').textContent = paresEncontrados;
            virados = [];
            bloqueado = false;
            if (paresEncontrados >= pares.length) {
              setTimeout(() => mostrarFeedbackMG(true, true), 300);
            }
          }, 500);
        } else {
          setTimeout(() => {
            a.el.classList.remove('mem-virado');
            b.el.classList.remove('mem-virado');
            a.el.classList.add('mem-erro-flash');
            b.el.classList.add('mem-erro-flash');
            setTimeout(() => {
              a.el.classList.remove('mem-erro-flash');
              b.el.classList.remove('mem-erro-flash');
            }, 400);
            virados = [];
            bloqueado = false;
          }, 900);
        }
      }
    });
    grid.appendChild(el);
  });
}

// ─── 2. SOM E PALAVRA ────────────────────────────────────────────────────────
function renderSomPalavra(fase, corpo, spec) {
  const palavras  = (fase.texto.replace(/<[^>]+>/g, '').match(/\b\w{4,}\b/g) || ['leitura']).slice(0, 6);
  const alvoPreset = spec && spec.alvo ? String(spec.alvo) : '';
  const alvo = alvoPreset || palavras[Math.floor(Math.random() * palavras.length)];
  const opcoesPreset = spec && Array.isArray(spec.opcoes) && spec.opcoes.length >= 2
    ? spec.opcoes.map(String)
    : null;
  const distratores = embaralhar(
    ['estrela','nuvem','pedra','livro','vento','chuva','foguete','floresta'].filter(p => p !== alvo)
  ).slice(0, 3);
  const opcoes = opcoesPreset
    ? embaralhar(opcoesPreset.includes(alvo) ? opcoesPreset : [alvo, ...opcoesPreset])
    : embaralhar([alvo, ...distratores]);

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <p class="mg-desc">Ouça a palavra e escolha a correta entre as opções!</p>
    <div style="text-align:center;margin:16px 0">
      <button class="btn-ouvir-palavra" id="btnOuvirPalavra" aria-label="Ouvir palavra">
        🔊 Ouvir a palavra
      </button>
    </div>
    <div style="text-align:center;margin:0 0 12px">
      <button class="btn-secundario" id="btnNaoOuco" aria-label="Não consigo ouvir">
        Não consigo ouvir
      </button>
    </div>
    <div class="sp-grid">
      ${opcoes.map(op => `<button class="sp-btn" data-palavra="${op}" aria-label="${op}">${op}</button>`).join('')}
    </div>
  `;
  corpo.appendChild(wrap);

  setTimeout(() => falarTexto(alvo), 400);

  document.getElementById('btnOuvirPalavra').addEventListener('click', () => falarTexto(alvo));
  document.getElementById('btnNaoOuco').addEventListener('click', () => {
    registrarEventoMG('som_palavra', 'nao_consigo_ouvir', { alvo });
    const alternativas = ['verdadeiro_falso', 'monta_frase', 'escolha', 'completar']
      .filter(t => !estado.minigamesLista.includes(t));
    const novoTipo = alternativas[0] || 'verdadeiro_falso';
    estado.minigamesLista[estado.minigameAtual] = novoTipo;
    if (estado.minigamesPreset && estado.minigamesPreset[estado.minigameAtual]) {
      estado.minigamesPreset[estado.minigameAtual] = { tipo: novoTipo };
    }
    renderizarMinigame();
    mostrarToast('Tudo bem! Vamos para outro jogo sem perder pontos 💛');
  });

  wrap.querySelectorAll('.sp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ok = btn.dataset.palavra === alvo;
      registrarEventoMG('som_palavra', ok ? 'acerto' : 'erro');
      wrap.querySelectorAll('.sp-btn').forEach(b => {
        b.disabled = true;
        if (b.dataset.palavra === alvo) b.classList.add('correta');
      });
      if (!ok) btn.classList.add('errada');
      mostrarFeedbackMG(ok);
    });
  });
}

function renderEscolhaMG(fase, corpo, spec) {
  let pergunta;
  let opcoes;
  let correta;
  if (spec && spec.pergunta && Array.isArray(spec.opcoes) && spec.opcoes.length >= 2) {
    pergunta = spec.pergunta;
    opcoes = spec.opcoes.map(String);
    correta = typeof spec.correta === 'number' ? spec.correta : 0;
  } else {
    const inter = fase.interacao && fase.interacao.tipo === 'escolha' ? fase.interacao : null;
    pergunta = inter ? inter.pergunta : 'Qual opção está correta sobre a história?';
    opcoes = inter ? inter.opcoes : ['Opção A', 'Opção B'];
    correta = inter ? inter.correta : 0;
  }
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <p class="mg-desc">${pergunta}</p>
    <div class="mc-opcoes">
      ${opcoes.map((op, i) => `<button class="mc-btn" data-idx="${i}">${op}</button>`).join('')}
    </div>
  `;
  corpo.appendChild(wrap);
  wrap.querySelectorAll('.mc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const ok = idx === correta;
      registrarEventoMG('escolha', ok ? 'acerto' : 'erro');
      wrap.querySelectorAll('.mc-btn').forEach(b => {
        b.disabled = true;
        if (parseInt(b.dataset.idx, 10) === correta) b.classList.add('correta');
      });
      if (!ok) btn.classList.add('errada');
      mostrarFeedbackMG(ok);
    });
  });
}

function renderCompletarMG(fase, corpo, spec) {
  const h = estado.historiaAtual;
  const dados = montarDadosCompletarMG(fase, h, spec);
  const wrap = document.createElement('div');
  wrap.className = 'mg-completar-wrap';
  wrap.innerHTML = `
    <p class="mg-desc">${dados.instrucao}</p>
    <div class="mg-frase-lacuna" id="mgFraseLacuna">${formatarFraseLacunaHtml(dados.frase)}</div>
    ${dados.dica ? `<p class="mg-completar-dica">💡 Dica: ${dados.dica}</p>` : ''}
    <div class="mg-completar-input-row interacao-input-area">
      <input type="text" class="interacao-input mg-input-palavra" id="mgInputCompletar"
        placeholder="Digite uma palavra..." autocomplete="off" aria-label="Palavra para completar a frase" maxlength="40" />
      <button class="btn-confirmar" id="mgBtnCompletar">✓ OK</button>
    </div>
  `;
  corpo.appendChild(wrap);
  const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const input = document.getElementById('mgInputCompletar');
  const btn = document.getElementById('mgBtnCompletar');
  const resposta = dados.resposta;
  const validar = () => {
    const v = norm(input.value);
    const c = norm(resposta);
    const ok = v === c || (v.length >= 2 && (c.includes(v) || v.includes(c)));
    registrarEventoMG('completar', ok ? 'acerto' : 'erro');
    input.disabled = true;
    btn.disabled = true;
    input.value = resposta;
    input.classList.add('correta');
    if (!ok) input.classList.add('errada');
    mostrarFeedbackMG(ok);
  };
  btn.addEventListener('click', validar);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') validar(); });
}

function renderColorirMG(h, corpo, spec) {
  const alvo = (spec && Array.isArray(spec.palavrasAlvo) && spec.palavrasAlvo.length
    ? spec.palavrasAlvo
    : (h.palavrasChave || []).slice(0, 5));
  const distratoras = (spec && Array.isArray(spec.distratoras) && spec.distratoras.length
    ? spec.distratoras
    : ['castelo', 'peixe', 'janela', 'foguete', 'estrada'])
    .filter((p) => !alvo.includes(p))
    .slice(0, 3);
  const itens = embaralhar([...alvo.map((p) => ({ p, correta: true })), ...distratoras.map((p) => ({ p, correta: false }))]);
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <p class="mg-desc">Clique nas palavras que aparecem na história!</p>
    <div class="rima-opcoes-grid">
      ${itens.map((it, i) => `<button class="rima-opc" data-idx="${i}">${it.p}</button>`).join('')}
    </div>
    <button class="btn-confirmar" id="btnConfColorir" style="margin-top:12px;width:100%">✔ Confirmar</button>
  `;
  corpo.appendChild(wrap);
  const selecionadas = new Set();
  wrap.querySelectorAll('.rima-opc').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      if (selecionadas.has(idx)) {
        selecionadas.delete(idx);
        btn.classList.remove('correta');
      } else {
        selecionadas.add(idx);
        btn.classList.add('correta');
      }
    });
  });
  document.getElementById('btnConfColorir').addEventListener('click', () => {
    let ok = true;
    itens.forEach((it, idx) => {
      const marcado = selecionadas.has(idx);
      if (marcado !== it.correta) ok = false;
    });
    registrarEventoMG('colorir', ok ? 'acerto' : 'erro');
    wrap.querySelectorAll('.rima-opc').forEach((btn, idx) => {
      btn.disabled = true;
      btn.classList.remove('correta');
      if (itens[idx].correta) btn.classList.add('correta');
      else if (selecionadas.has(idx)) btn.classList.add('errada');
    });
    document.getElementById('btnConfColorir').disabled = true;
    mostrarFeedbackMG(ok);
  });
}

// ─── 3. MONTA-FRASE ──────────────────────────────────────────────────────────
function renderMontaFrase(fase, corpo, spec) {
  const dadosSpec = spec ? extrairDadosMontaFrase(spec) : null;
  if (dadosSpec && dadosSpec.palavrasPool.length >= 2 && dadosSpec.palavrasCorretas.length >= 2) {
    const embaralhadas = embaralhar(dadosSpec.palavrasPool.map(String));
    const palavrasCorretas = dadosSpec.palavrasCorretas.map(String);
    let colocadosIdx = [];
    const wrap = document.createElement('div');
    wrap.className = 'mf-wrap';
    wrap.innerHTML = `
      <p class="mg-desc">${dadosSpec.pergunta}</p>
      <p class="mg-desc">Monte a frase clicando nas palavras. Clique em uma palavra já colocada para removê-la.</p>
      <div class="mf-espaco" id="mfEspaco"><span class="mf-placeholder">Clique nas palavras abaixo…</span></div>
      <div class="mf-pool" id="mfPool"></div>
      <button class="btn-confirmar" id="btnConfMF" style="margin-top:12px;width:100%">✔ Verificar</button>
    `;
    corpo.appendChild(wrap);
    function atualizarPreset() {
      const pool = document.getElementById('mfPool');
      const espaco = document.getElementById('mfEspaco');
      pool.innerHTML = embaralhadas.map((p, i) =>
        `<button class="mf-chip ${colocadosIdx.includes(i) ? 'mf-usada' : ''}" data-idx="${i}">${p}</button>`
      ).join('');
      if (colocadosIdx.length === 0) {
        espaco.innerHTML = '<span class="mf-placeholder">Clique nas palavras abaixo…</span>';
      } else {
        espaco.innerHTML = colocadosIdx.map((i, pos) =>
          `<button class="mf-colocada" data-pos="${pos}">${embaralhadas[i]}</button>`
        ).join(' ');
      }
      pool.querySelectorAll('.mf-chip:not(.mf-usada)').forEach(btn => {
        btn.addEventListener('click', () => {
          colocadosIdx.push(parseInt(btn.dataset.idx, 10));
          atualizarPreset();
        });
      });
      espaco.querySelectorAll('.mf-colocada').forEach(btn => {
        btn.addEventListener('click', () => {
          colocadosIdx.splice(parseInt(btn.dataset.pos, 10), 1);
          atualizarPreset();
        });
      });
    }
    atualizarPreset();
    const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    document.getElementById('btnConfMF').addEventListener('click', () => {
      if (colocadosIdx.length < 2) { mostrarToast('Monte a frase primeiro! 😊'); return; }
      const tentativa = norm(colocadosIdx.map(i => embaralhadas[i]).join(' '));
      const correta = norm(palavrasCorretas.join(' '));
      const ok = tentativa === correta;
      document.getElementById('btnConfMF').disabled = true;
      revelarMontaFraseCorreta(palavrasCorretas);
      registrarEventoMG('monta_frase', ok ? 'acerto' : 'erro');
      mostrarFeedbackMG(ok);
    });
    return;
  }

  const textoLimpo = fase.texto.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const todasFrases = textoLimpo.split(/[.!?]/).map(f => f.trim()).filter(f => {
    const p = f.split(' ').filter(Boolean);
    return p.length >= 3 && p.length <= 9;
  });
  const frase = todasFrases[0] || textoLimpo.split(' ').slice(0, 7).join(' ');
  const palavrasCorretas = frase.split(' ').filter(Boolean);
  const embaralhadas     = embaralhar([...palavrasCorretas]);

  let colocadosIdx = [];

  const wrap = document.createElement('div');
  wrap.className = 'mf-wrap';
  wrap.innerHTML = `
    <div class="mg-texto-contexto">${fase.texto}</div>
    <p class="mg-desc">Monte a frase clicando nas palavras. Clique em uma palavra já colocada para removê-la.</p>
    <div class="mf-espaco" id="mfEspaco"><span class="mf-placeholder">Clique nas palavras abaixo…</span></div>
    <div class="mf-pool" id="mfPool"></div>
    <button class="btn-confirmar" id="btnConfMF" style="margin-top:12px;width:100%">✔ Verificar</button>
  `;
  corpo.appendChild(wrap);

  function atualizar() {
    const pool   = document.getElementById('mfPool');
    const espaco = document.getElementById('mfEspaco');

    pool.innerHTML = embaralhadas.map((p, i) =>
      `<button class="mf-chip ${colocadosIdx.includes(i) ? 'mf-usada' : ''}" data-idx="${i}">${p}</button>`
    ).join('');

    if (colocadosIdx.length === 0) {
      espaco.innerHTML = '<span class="mf-placeholder">Clique nas palavras abaixo…</span>';
    } else {
      espaco.innerHTML = colocadosIdx.map((i, pos) =>
        `<button class="mf-colocada" data-pos="${pos}">${embaralhadas[i]}</button>`
      ).join(' ');
    }

    pool.querySelectorAll('.mf-chip:not(.mf-usada)').forEach(btn => {
      btn.addEventListener('click', () => {
        colocadosIdx.push(parseInt(btn.dataset.idx));
        atualizar();
      });
    });

    espaco.querySelectorAll('.mf-colocada').forEach(btn => {
      btn.addEventListener('click', () => {
        colocadosIdx.splice(parseInt(btn.dataset.pos), 1);
        atualizar();
      });
    });
  }
  atualizar();

  document.getElementById('btnConfMF').addEventListener('click', () => {
    if (colocadosIdx.length < 2) { mostrarToast('Monte a frase primeiro! 😊'); return; }
    const tentativa = colocadosIdx.map(i => embaralhadas[i]).join(' ').toLowerCase().trim();
    const correta   = palavrasCorretas.join(' ').toLowerCase().trim();
    const ok = tentativa === correta;
    document.getElementById('btnConfMF').disabled = true;
    revelarMontaFraseCorreta(palavrasCorretas);
    registrarEventoMG('monta_frase', ok ? 'acerto' : 'erro');
    mostrarFeedbackMG(ok);
  });
}

// ─── 4. VERDADEIRO OU FALSO ──────────────────────────────────────────────────
function renderVerdadeiroFalso(fase, h, corpo, spec) {
  let item;
  if (spec && (spec.afirmacao || spec.pergunta) && typeof spec.correta === 'number') {
    const afirmacao = String(spec.afirmacao || spec.pergunta || '').trim();
    item = { afirmacao, correta: spec.correta === 0 };
  } else if (spec && (spec.afirmacao || spec.pergunta)) {
    const afirmacao = String(spec.afirmacao || spec.pergunta || '').trim();
    item = { afirmacao, correta: true };
  } else {
    const kw = (h.palavrasChave || ['personagem'])[0];
    const textoFase = fase.texto.replace(/<[^>]+>/g, '').split(/[.!?]/)[0].trim();

    const pares = [
      { afirmacao: textoFase.length > 10 ? textoFase + '.' : `A história fala sobre "${kw}".`, correta: true },
      { afirmacao: `A história se passa em outro planeta.`, correta: false },
      { afirmacao: `${kw} é mencionado na história.`, correta: true },
      { afirmacao: `A história não tem personagens.`, correta: false }
    ];
    item = pares[Math.floor(Math.random() * pares.length)];
  }

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <p class="mg-desc">Leia a afirmação e diga se é verdadeira ou falsa!</p>
    <div class="tf-afirmacao">"${item.afirmacao}"</div>
    <div class="tf-opcoes">
      <button class="tf-btn tf-v" id="tfV" aria-label="Verdadeiro">✅ Verdadeiro</button>
      <button class="tf-btn tf-f" id="tfF" aria-label="Falso">❌ Falso</button>
    </div>
  `;
  corpo.appendChild(wrap);

  const verificar = (resp) => {
    const ok = resp === item.correta;
    document.getElementById('tfV').disabled = true;
    document.getElementById('tfF').disabled = true;
    const btnCorreto = item.correta ? document.getElementById('tfV') : document.getElementById('tfF');
    btnCorreto.classList.add('correta');
    if (!ok) (resp ? document.getElementById('tfV') : document.getElementById('tfF')).classList.add('errada');
    registrarEventoMG('verdadeiro_falso', ok ? 'acerto' : 'erro');
    mostrarFeedbackMG(ok);
  };

  document.getElementById('tfV').addEventListener('click', () => verificar(true));
  document.getElementById('tfF').addEventListener('click', () => verificar(false));
}

// ─── 5. CAÇA-PALAVRAS ────────────────────────────────────────────────────────
function renderCacaPalavras(fase, h, corpo) {
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'').substring(0, 15);
  const palavrasAlvo = [...new Set(
    (h.palavrasChave || []).map(normalize).filter(p => p.length >= 3 && p.length <= 15)
  )].slice(0, 4);

  if (palavrasAlvo.length === 0) { renderVerdadeiroFalso(fase, h, corpo, null); return; }

  const TAM = 12;
  const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const grade  = Array.from({ length: TAM }, () => Array(TAM).fill(''));
  const posicoes = {};

  palavrasAlvo.forEach(palavra => {
    const dirs = [{ dr:0, dc:1 }, { dr:1, dc:0 }];
    let inserida = false;
    for (let t = 0; t < 500 && !inserida; t++) {
      const { dr, dc } = dirs[Math.floor(Math.random() * dirs.length)];
      const maxR = dr === 0 ? TAM : TAM - palavra.length;
      const maxC = dc === 0 ? TAM : TAM - palavra.length;
      if (maxR <= 0 || maxC <= 0) continue;
      const sR = Math.floor(Math.random() * maxR);
      const sC = Math.floor(Math.random() * maxC);
      let ok = true;
      for (let i = 0; i < palavra.length; i++) {
        const r = sR + dr*i, c = sC + dc*i;
        if (grade[r][c] !== '' && grade[r][c] !== palavra[i]) { ok = false; break; }
      }
      if (ok) {
        const cells = [];
        for (let i = 0; i < palavra.length; i++) {
          grade[sR + dr*i][sC + dc*i] = palavra[i];
          cells.push({ r: sR + dr*i, c: sC + dc*i });
        }
        posicoes[palavra] = cells;
        inserida = true;
      }
    }
  });

  for (let r = 0; r < TAM; r++)
    for (let c = 0; c < TAM; c++)
      if (grade[r][c] === '')
        grade[r][c] = LETRAS[Math.floor(Math.random() * LETRAS.length)];

  const dispW = Math.min(window.innerWidth, 700) - 48;
  const CEL   = Math.max(22, Math.min(30, Math.floor(dispW / TAM)));
  const FSIZE = Math.max(9, CEL - 14);

  const CORES_PALAVRAS = ['#A855F7','#FF6B35','#22C55E','#3B82F6'];

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <p class="mg-desc">Arraste da <strong>primeira</strong> até a <strong>última letra</strong> para marcar a palavra!</p>
    <div class="cp-alvos" id="cpAlvos">
      ${palavrasAlvo.map((p, i) => `<span class="cp-alvo" id="cpa-${p}" style="--cor-palavra:${CORES_PALAVRAS[i % CORES_PALAVRAS.length]}">${p}</span>`).join('')}
    </div>
    <div class="cp-scroll-wrap">
      <div class="cp-grade" id="cpGrade" style="grid-template-columns:repeat(${TAM},${CEL}px);width:${TAM*CEL+TAM*2}px"></div>
    </div>
    <button class="btn-confirmar" id="btnConfCP" style="margin-top:14px;width:100%">✔ Terminei</button>
  `;
  corpo.appendChild(wrap);

  const gridEl = document.getElementById('cpGrade');
  for (let r = 0; r < TAM; r++) {
    for (let c = 0; c < TAM; c++) {
      const cell = document.createElement('div');
      cell.className  = 'cp-cel';
      cell.style.cssText = `width:${CEL}px;height:${CEL}px;font-size:${FSIZE}px`;
      cell.textContent = grade[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
      gridEl.appendChild(cell);
    }
  }

  let arrastando  = false;
  let primeira    = null;
  let encontradas = new Set();

  function getCell(r, c) { return gridEl.children[r * TAM + c]; }

  function limparPreview() {
    gridEl.querySelectorAll('.cp-preview').forEach(el => {
      el.classList.remove('cp-preview');
      el.style.removeProperty('--preview-color');
    });
  }

  function coletarSegmento(r1, c1, r2, c2) {
    const dr = r1 === r2 ? 0 : (r2 > r1 ? 1 : -1);
    const dc = c1 === c2 ? 0 : (c2 > c1 ? 1 : -1);
    const res = [];
    let r = r1, c = c1;
    for (;;) {
      res.push({ r, c, letra: grade[r][c] });
      if (r === r2 && c === c2) break;
      r += dr; c += dc;
    }
    return res;
  }

  function destacarPreview(r1, c1, r2, c2, cor) {
    limparPreview();
    const dr = r1 === r2 ? 0 : (r2 > r1 ? 1 : -1);
    const dc = c1 === c2 ? 0 : (c2 > c1 ? 1 : -1);
    if (dr !== 0 && dc !== 0) return;
    let r = r1, c = c1;
    for (;;) {
      const el = getCell(r, c);
      if (el && !el.classList.contains('cp-found')) {
        el.classList.add('cp-preview');
        el.style.setProperty('--preview-color', cor);
      }
      if (r === r2 && c === c2) break;
      r += dr; c += dc;
    }
  }

  function tentarConfirmar(r1, c1, r2, c2) {
    const isH = r1 === r2, isV = c1 === c2;
    if (!isH && !isV) return false;
    const seg = coletarSegmento(r1, c1, r2, c2);
    const palavra  = seg.map(s => s.letra).join('');
    const palavraR = [...palavra].reverse().join('');
    limparPreview();

    const match = palavrasAlvo.find(p => p === palavra || p === palavraR);
    if (match && !encontradas.has(match)) {
      const cor = CORES_PALAVRAS[palavrasAlvo.indexOf(match) % CORES_PALAVRAS.length];
      encontradas.add(match);
      seg.forEach(({ r: sr, c: sc }) => {
        const el = getCell(sr, sc);
        if (el) {
          el.classList.remove('cp-preview');
          el.classList.add('cp-found');
          el.style.setProperty('--found-color', cor);
        }
      });
      document.getElementById('cpa-' + match)?.classList.add('cp-alvo-found');

      if (encontradas.size >= palavrasAlvo.length) {
        mostrarFeedbackMG(true, true);
        document.getElementById('btnConfCP').disabled = true;
      } else {
        const area = document.getElementById('mg-feedback');
        const card = document.getElementById('mg-feedback-card');
        const emoji = document.getElementById('mg-feedback-emoji');
        const msg   = document.getElementById('mg-feedback-msg');
        area.classList.remove('oculto');
        card.style.background  = 'linear-gradient(135deg,#DCFCE7,#D1FAE5)';
        card.style.borderColor = 'var(--cor-verde)';
        emoji.textContent      = '🎉';
        msg.textContent        = `Encontrou "${match}"! (${encontradas.size}/${palavrasAlvo.length})`;
        msg.style.color        = '#166534';
      }
      return true;
    } else if (!match || encontradas.has(match)) {
      seg.forEach(({ r: sr, c: sc }) => {
        const el = getCell(sr, sc);
        if (el) { el.classList.add('cp-wrong'); setTimeout(() => el.classList.remove('cp-wrong'), 500); }
      });
      return false;
    }
    return false;
  }

  function getCellFromPoint(x, y) {
    const els = document.elementsFromPoint(x, y);
    return els.find(e => e.classList.contains('cp-cel'));
  }

  const PREVIEW_COLOR = '#FBBF24';

  gridEl.querySelectorAll('.cp-cel').forEach(cell => {
    cell.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (cell.classList.contains('cp-found')) return;
      arrastando = true;
      primeira = { r: parseInt(cell.dataset.r), c: parseInt(cell.dataset.c) };
      limparPreview();
      cell.classList.add('cp-sel');
    });

    cell.addEventListener('mouseenter', (e) => {
      if (!arrastando || !primeira) return;
      if (cell.classList.contains('cp-found')) return;
      const r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
      gridEl.querySelectorAll('.cp-sel').forEach(el => el.classList.remove('cp-sel'));
      destacarPreview(primeira.r, primeira.c, r, c, PREVIEW_COLOR);
    });

    cell.addEventListener('mouseup', (e) => {
      if (!arrastando || !primeira) return;
      const r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
      if (r === primeira.r && c === primeira.c) {
        limparPreview();
        cell.classList.remove('cp-sel');
        arrastando = false; primeira = null; return;
      }
      tentarConfirmar(primeira.r, primeira.c, r, c);
      gridEl.querySelectorAll('.cp-sel').forEach(el => el.classList.remove('cp-sel'));
      arrastando = false; primeira = null;
    });
  });

  gridEl.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const cell = getCellFromPoint(t.clientX, t.clientY);
    if (!cell || cell.classList.contains('cp-found')) return;
    arrastando = true;
    primeira = { r: parseInt(cell.dataset.r), c: parseInt(cell.dataset.c) };
    limparPreview();
    cell.classList.add('cp-sel');
  }, { passive: false });

  gridEl.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!arrastando || !primeira) return;
    const t = e.touches[0];
    const cell = getCellFromPoint(t.clientX, t.clientY);
    if (!cell || cell.classList.contains('cp-found')) return;
    const r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
    gridEl.querySelectorAll('.cp-sel').forEach(el => el.classList.remove('cp-sel'));
    destacarPreview(primeira.r, primeira.c, r, c, PREVIEW_COLOR);
  }, { passive: false });

  gridEl.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!arrastando || !primeira) return;
    const t = e.changedTouches[0];
    const cell = getCellFromPoint(t.clientX, t.clientY);
    if (cell) {
      const r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
      if (!(r === primeira.r && c === primeira.c)) {
        tentarConfirmar(primeira.r, primeira.c, r, c);
      }
    }
    limparPreview();
    gridEl.querySelectorAll('.cp-sel').forEach(el => el.classList.remove('cp-sel'));
    arrastando = false; primeira = null;
  }, { passive: false });

  document.addEventListener('mouseup', () => {
    if (arrastando) {
      limparPreview();
      gridEl.querySelectorAll('.cp-sel').forEach(el => el.classList.remove('cp-sel'));
      arrastando = false; primeira = null;
    }
  });

  document.getElementById('btnConfCP').addEventListener('click', () => {
    document.getElementById('btnConfCP').disabled = true;
    palavrasAlvo.forEach(palavra => {
      if (!encontradas.has(palavra) && posicoes[palavra]) {
        const cor = CORES_PALAVRAS[palavrasAlvo.indexOf(palavra) % CORES_PALAVRAS.length];
        posicoes[palavra].forEach(({ r, c }) => {
          const el = getCell(r, c);
          if (el) {
            el.classList.add('cp-missed');
            el.style.setProperty('--found-color', cor);
          }
        });
        document.getElementById('cpa-' + palavra)?.classList.add('cp-alvo-found');
      }
    });
    const ok = encontradas.size >= palavrasAlvo.length;
    registrarEventoMG('caca_palavras', ok ? 'acerto' : 'erro');
    mostrarFeedbackMG(ok);
  });
}

// ─── 6. LIGAR OS PONTOS ──────────────────────────────────────────────────────
function renderLigarPontos(fase, h, corpo) {
  const BANCO_DEFS = {
    sol:'Estrela que ilumina o dia', lua:'Astro que brilha à noite',
    agua:'Líquido essencial à vida', fogo:'Chama que aquece e ilumina',
    vento:'Movimento do ar', chuva:'Água que cai do céu',
    flor:'Parte colorida da planta', arvore:'Planta de tronco grande',
    peixe:'Animal que vive na água', passaro:'Animal que voa com asas',
    casa:'Lugar onde a família vive', escola:'Lugar onde se aprende',
    livro:'Objeto cheio de histórias', menino:'Criança do sexo masculino',
    menina:'Criança do sexo feminino', gato:'Animal doméstico que mia',
    cachorro:'Animal doméstico que late', cavalo:'Animal que galopa',
    leao:'Rei da selva com juba', floresta:'Conjunto de muitas árvores',
    mar:'Grande extensão de água salgada', rio:'Corrente de água doce',
    montanha:'Elevação grande de terra', estrela:'Ponto de luz no céu',
    nuvem:'Massa de vapor no céu', pedra:'Material sólido da natureza',
    terra:'Solo onde as plantas crescem', mel:'Alimento doce das abelhas',
    rei:'Governante de um reino', rainha:'Governante de um reino',
    fada:'Ser mágico das histórias', dragao:'Criatura mítica que cospe fogo',
    gigante:'Ser de tamanho enorme', bruxa:'Personagem mágica das fábulas',
    castelo:'Grande construção de pedra', magia:'Poder sobrenatural',
    coragem:'Força para enfrentar o medo', amizade:'Laço afetivo entre pessoas',
    pao:'Alimento feito de farinha', barco:'Veículo que navega na água',
    ponte:'Estrutura que une dois lados', navio:'Grande barco do mar',
    praia:'Areia à beira do mar', campo:'Área aberta de terra',
    cidade:'Local com muitas casas', aldeia:'Pequeno grupo de casas',
  };

  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'');
  const FALLBACK = [
    {palavra:'Sol',   def:'Estrela que ilumina o dia'},
    {palavra:'Lua',   def:'Astro que brilha à noite'},
    {palavra:'Livro', def:'Objeto cheio de histórias'},
    {palavra:'Flor',  def:'Parte colorida da planta'},
  ];

  let pares = [];
  (h.palavrasChave || []).forEach(kw => {
    const k = norm(kw);
    if (BANCO_DEFS[k] && !pares.find(p => norm(p.palavra) === k))
      pares.push({ palavra: kw, def: BANCO_DEFS[k] });
  });
  while (pares.length < 3) {
    const fb = FALLBACK[pares.length % FALLBACK.length];
    if (!pares.find(p => norm(p.palavra) === norm(fb.palavra))) pares.push(fb);
    else pares.push(FALLBACK[(pares.length + 1) % FALLBACK.length]);
  }
  pares = pares.slice(0, 4);

  const esquerda = embaralhar([...pares]);
  const direita  = embaralhar([...pares]);
  const CORES = ['#A855F7','#FF6B35','#22C55E','#3B82F6'];

  let selecionado = null;
  let ligacoes    = [];
  let acertos     = 0;

  const wrap = document.createElement('div');
  wrap.className = 'lp-wrap';
  wrap.innerHTML = `
    <p class="mg-desc">Clique em uma <strong>palavra</strong> e depois em sua <strong>definição</strong> para ligar!</p>
    <div class="lp-arena" id="lpArena">
      <div class="lp-col" id="lpEsq">
        ${esquerda.map((p,i)=>`<button class="lp-btn lp-palavra" data-lado="esq" data-i="${i}" data-k="${norm(p.palavra)}">${p.palavra}</button>`).join('')}
      </div>
      <div class="lp-col" id="lpDir">
        ${direita.map((p,i)=>`<button class="lp-btn lp-def" data-lado="dir" data-i="${i}" data-k="${norm(p.palavra)}">${p.def}</button>`).join('')}
      </div>
    </div>
    <svg class="lp-svg" id="lpSvg"></svg>
    <button class="btn-confirmar" id="btnConfLP" style="margin-top:14px;width:100%">✔ Verificar</button>
  `;
  corpo.appendChild(wrap);

  function midRight(el) {
    const wr = wrap.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return { x: er.right - wr.left, y: er.top + er.height / 2 - wr.top };
  }
  function midLeft(el) {
    const wr = wrap.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return { x: er.left - wr.left, y: er.top + er.height / 2 - wr.top };
  }

  function redrawSvg() {
    const svg = document.getElementById('lpSvg');
    if (!svg) return;
    const wr = wrap.getBoundingClientRect();
    svg.setAttribute('width',  wr.width);
    svg.setAttribute('height', wr.height);
    svg.innerHTML = '';
    ligacoes.forEach(lig => {
      const eEl = wrap.querySelector(`#lpEsq [data-k="${lig.eKey}"]`);
      const dEl = wrap.querySelector(`#lpDir [data-k="${lig.dKey}"]`);
      if (!eEl || !dEl) return;
      const p1 = midRight(eEl);
      const p2 = midLeft(dEl);
      const cx = (p1.x + p2.x) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d', `M${p1.x},${p1.y} C${cx},${p1.y} ${cx},${p2.y} ${p2.x},${p2.y}`);
      path.setAttribute('stroke', lig.cor);
      path.setAttribute('stroke-width', '3.5');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      svg.appendChild(path);
    });
  }

  wrap.querySelectorAll('.lp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('lp-ligado')) return;
      const lado = btn.dataset.lado;
      const k    = btn.dataset.k;

      if (!selecionado) {
        wrap.querySelectorAll('.lp-btn.lp-ativo').forEach(b => b.classList.remove('lp-ativo'));
        btn.classList.add('lp-ativo');
        selecionado = { lado, k };
        return;
      }

      if (selecionado.lado === lado) {
        wrap.querySelectorAll('.lp-btn.lp-ativo').forEach(b => b.classList.remove('lp-ativo'));
        btn.classList.add('lp-ativo');
        selecionado = { lado, k };
        return;
      }

      const eKey = lado === 'dir' ? selecionado.k : k;
      const dKey = lado === 'dir' ? k : selecionado.k;
      wrap.querySelectorAll('.lp-btn.lp-ativo').forEach(b => b.classList.remove('lp-ativo'));
      selecionado = null;

      const ok  = eKey === dKey;
      const cor = ok ? CORES[acertos % CORES.length] : '#EF4444';
      const eEl = wrap.querySelector(`#lpEsq [data-k="${eKey}"]`);
      const dEl = wrap.querySelector(`#lpDir [data-k="${dKey}"]`);

      if (ok) {
        acertos++;
        [eEl, dEl].forEach(el => {
          el.classList.add('lp-ligado','lp-certo');
          el.style.borderColor = cor;
          el.style.color = cor;
        });
        ligacoes.push({ eKey, dKey, cor });
        requestAnimationFrame(() => redrawSvg());
        if (acertos >= pares.length) {
          setTimeout(() => mostrarFeedbackMG(true, true), 400);
          document.getElementById('btnConfLP').disabled = true;
        }
      } else {
        [eEl, dEl].forEach(el => {
          if (!el) return;
          el.classList.add('lp-erro');
          setTimeout(() => el.classList.remove('lp-erro'), 600);
        });
      }
    });
  });

  document.getElementById('btnConfLP').addEventListener('click', () => {
    document.getElementById('btnConfLP').disabled = true;
    pares.forEach(par => {
      const k = norm(par.palavra);
      const eEl = wrap.querySelector(`#lpEsq [data-k="${k}"]`);
      const dEl = wrap.querySelector(`#lpDir [data-k="${k}"]`);
      if (eEl && dEl && !eEl.classList.contains('lp-ligado')) {
        [eEl, dEl].forEach(el => el.classList.add('lp-revelado'));
        ligacoes.push({ eKey: k, dKey: k, cor: '#9CA3AF' });
      }
    });
    requestAnimationFrame(() => redrawSvg());
    mostrarFeedbackMG(acertos > 0, true);
  });

  const onResize = () => requestAnimationFrame(() => redrawSvg());
  window.addEventListener('resize', onResize);
}

// ─── 7. RIMA ────────────────────────────────────────────────────────────────
function renderRima(h, corpo, spec) {
  const pares = [
    { palavra:'sol',   rima:'farol',  erradas:['livro','pedra','chuva'] },
    { palavra:'mar',   rima:'voar',   erradas:['correr','dormir','andar'] },
    { palavra:'flor',  rima:'amor',   erradas:['pedra','vento','carro'] },
    { palavra:'lua',   rima:'rua',    erradas:['livro','estrela','pedra'] },
    { palavra:'pão',   rima:'mão',    erradas:['neve','chuva','bola'] },
    { palavra:'gato',  rima:'prato',  erradas:['nuvem','janela','caixa'] },
    { palavra:'fada',  rima:'espada', erradas:['livro','pedra','carro'] },
    { palavra:'chuva', rima:'uva',    erradas:['pedra','livro','nuvem'] },
    { palavra:'leão',  rima:'balão',  erradas:['pedra','carro','livro'] },
    { palavra:'fogo',  rima:'jogo',   erradas:['pedra','livro','carro'] }
  ];
  let par;
  let opcoes;
  if (spec && spec.palavra && spec.rima && Array.isArray(spec.opcoes) && spec.opcoes.length >= 2) {
    par = { palavra: String(spec.palavra), rima: String(spec.rima), erradas: [] };
    opcoes = embaralhar(spec.opcoes.map(String));
  } else {
    const kws = (h.palavrasChave || []).map(p => p.toLowerCase());
    par = pares.find(pr => kws.some(k => k.includes(pr.palavra) || pr.palavra.includes(k)));
    if (!par) par = pares[Math.floor(Math.random() * pares.length)];
    opcoes = embaralhar([par.rima, ...par.erradas.slice(0,3)]);
  }

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <p class="mg-desc">Escolha a palavra que rima com a palavra destacada!</p>
    <div class="rima-destaque">
      <span class="rima-label">Rima com:</span>
      <span class="rima-palavra-alvo">${par.palavra}</span>
    </div>
    <div class="rima-opcoes-grid">
      ${opcoes.map(op => `<button class="rima-opc" data-rima="${op}" aria-label="${op}">${op}</button>`).join('')}
    </div>
  `;
  corpo.appendChild(wrap);

  wrap.querySelectorAll('.rima-opc').forEach(btn => {
    btn.addEventListener('click', () => {
      const ok = btn.dataset.rima === par.rima;
      wrap.querySelectorAll('.rima-opc').forEach(b => {
        b.disabled = true;
        if (b.dataset.rima === par.rima) b.classList.add('correta');
      });
      if (!ok) btn.classList.add('errada');
      mostrarFeedbackMG(ok);
    });
  });
}

// ─── 8. QUEM DISSE ISSO? ────────────────────────────────────────────────────
function renderQuemDisse(fase, h, corpo, spec) {
  const todos = [...new Set(
    h.fases.flatMap(f => (f.personagens || []))
  )].filter(Boolean);

  let alvo = 'Narrador';
  let opcoes = [];
  let trecho = '';
  if (spec && Array.isArray(spec.opcoes) && spec.opcoes.length >= 2) {
    opcoes = spec.opcoes.map(String);
    alvo = opcoes[Math.min(opcoes.length - 1, Math.max(0, normalizarCorreta(spec.correta)))];
    trecho = String(spec.fala || spec.pergunta || '').trim();
  } else {
    const personagens = todos.length > 0 ? todos : (h.palavrasChave || []).slice(0, 3);
    alvo = personagens[0] || 'Narrador';
    const distratores = embaralhar(
      ['Narrador','Dragão','Fada','Rei','Bruxo','Lobo','Gigante'].filter(p => p !== alvo)
    ).slice(0, 3);
    opcoes = embaralhar([alvo, ...distratores]);
    const textoLimpo = fase.texto.replace(/<[^>]+>/g, '');
    trecho = textoLimpo.substring(0, 90).trim() + '…';
  }

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <p class="mg-desc">Leia o trecho e descubra quem disse isso na história!</p>
    <div class="qd-trecho">"${trecho}"</div>
    <div class="qd-opcoes">
      ${opcoes.map(op => `<button class="qd-btn" data-nome="${op}" aria-label="${op}">${op}</button>`).join('')}
    </div>
  `;
  corpo.appendChild(wrap);

  wrap.querySelectorAll('.qd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ok = btn.dataset.nome === alvo;
      wrap.querySelectorAll('.qd-btn').forEach(b => {
        b.disabled = true;
        if (b.dataset.nome === alvo) b.classList.add('correta');
      });
      if (!ok) btn.classList.add('errada');
      mostrarFeedbackMG(ok);
    });
  });
}

// ─── 9. ORDENAR PASSOS ──────────────────────────────────────────────────────
function renderOrdenarPassos(h, corpo, spec) {
  function extrairFraseCompleta(fase, fallbackIdx) {
    const txt = fase.texto.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const frases = txt.match(/[^.!?]+[.!?]+/g) || [txt];
    const ideal = frases.find(f => f.trim().length >= 40 && f.trim().length <= 120);
    if (ideal) return ideal.trim();
    const maior = frases.slice().sort((a, b) => b.length - a.length)[0];
    return (maior || txt).trim() || `Evento ${fallbackIdx + 1}`;
  }

  let passos;
  if (spec && Array.isArray(spec.passos) && spec.passos.length >= 3) {
    passos = spec.passos.map((txt, i) => ({ id: i, texto: String(txt) }));
  } else {
    const fasesUsadas = h.fases.length > 5 ? h.fases.slice(0, 5) : h.fases;
    passos = fasesUsadas.map((f, i) => ({
      id: i,
      texto: extrairFraseCompleta(f, i)
    }));
  }
  let ordem = embaralhar([...passos.map((_, i) => i)]);

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <p class="mg-desc">Use as setas ↑↓ para colocar os eventos da história na ordem correta!</p>
    <ul class="op-lista" id="opLista"></ul>
    <button class="btn-confirmar" id="btnConfOP" style="margin-top:12px;width:100%">✔ Confirmar Ordem</button>
  `;
  corpo.appendChild(wrap);

  function renderLista() {
    const lista = document.getElementById('opLista');
    if (!lista) return;
    lista.innerHTML = ordem.map((id, i) => `
      <li class="op-item">
        <span class="op-num">${i + 1}</span>
        <span class="op-texto">${passos[id].texto}</span>
        <div class="op-setas">
          <button class="op-seta" data-action="up"   data-i="${i}" aria-label="Mover para cima"  ${i === 0                ? 'disabled' : ''}>↑</button>
          <button class="op-seta" data-action="down" data-i="${i}" aria-label="Mover para baixo" ${i === ordem.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
      </li>
    `).join('');

    lista.querySelectorAll('.op-seta').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.i);
        if (btn.dataset.action === 'up' && i > 0) {
          [ordem[i], ordem[i-1]] = [ordem[i-1], ordem[i]];
        } else if (btn.dataset.action === 'down' && i < ordem.length - 1) {
          [ordem[i], ordem[i+1]] = [ordem[i+1], ordem[i]];
        }
        renderLista();
      });
    });
  }
  renderLista();

  document.getElementById('btnConfOP').addEventListener('click', () => {
    const correta = passos.map((_, i) => i);
    const ok = JSON.stringify(ordem) === JSON.stringify(correta);
    ordem = [...correta];
    renderLista();
    document.querySelectorAll('.op-item').forEach(li => li.classList.add('correta'));
    document.querySelectorAll('.op-seta').forEach(b => b.disabled = true);
    document.getElementById('btnConfOP').disabled = true;
    registrarEventoMG('ordenar_passos', ok ? 'acerto' : 'erro');
    mostrarFeedbackMG(ok);
  });
}
