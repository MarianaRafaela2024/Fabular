/* =============================================
   login.js — Login da criança + Portão Parental
   ============================================= */
'use strict';

(function () {

  /* ─────────────────────────────────────────
     PARTE 1 — PERFIL DA CRIANÇA
  ───────────────────────────────────────── */

  const perfil = { nome: '', avatar: '🦁', faixa: 1, genero: 'narrativo' };
  const CHAVE_ESTADO = 'mundoHistorias_estado';
  const CHAVE_CONTAS = 'mundoHistorias_contas';
  const CHAVE_SESSAO = 'mundoHistorias_responsavel_sessao';
  const CHAVE_CRIANCAS_PENDENTES = 'mundoHistorias_criancas_pendentes';
  const CHAVE_VINCULOS = 'mundoHistorias_vinculos_crianca';
  const API_BASE = (window.API_BASE_URL || 'http://localhost:5275').replace(/\/$/, '');
  let responsavelModo = 'login';

  function carregarJSON(chave, fallback) {
    try {
      const raw = localStorage.getItem(chave);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }
  function salvarJSON(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
  }

  async function apiRequest(path, method, body) {
    const resp = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!resp.ok) {
      let msg = `Erro ${resp.status}`;
      try {
        const data = await resp.json();
        if (data && data.message) msg = data.message;
      } catch (_) {}
      throw new Error(msg);
    }
    return resp.json();
  }

  function criarLocalChildKey(perf) {
    const base = `${String(perf.nome || '').trim().toLowerCase()}-${String(perf.avatar || '')}-${Date.now()}`;
    return base.replace(/\s+/g, '-');
  }

  function registrarCriancaPendente(perf) {
    const pendentes = carregarJSON(CHAVE_CRIANCAS_PENDENTES, []);
    const novo = {
      localChildKey: criarLocalChildKey(perf),
      nome: perf.nome,
      faixaEtaria: perf.faixa,
      avatar: perf.avatar,
      generoFavorito: perf.genero,
      createdAt: new Date().toISOString(),
      synced: false
    };
    pendentes.push(novo);
    salvarJSON(CHAVE_CRIANCAS_PENDENTES, pendentes);
    return novo;
  }

  async function sincronizarCriancasPendentes(sessao) {
    const pendentes = carregarJSON(CHAVE_CRIANCAS_PENDENTES, []);
    if (!sessao || !sessao.responsavelId || !pendentes.length) return;
    const naoSincronizados = pendentes.filter(c => !c.synced);
    if (!naoSincronizados.length) return;

    const payload = {
      responsavelId: sessao.responsavelId,
      childrenLocal: naoSincronizados.map(c => ({
        localChildKey: c.localChildKey,
        nome: c.nome,
        faixaEtaria: c.faixaEtaria,
        avatar: c.avatar,
        generoFavorito: c.generoFavorito,
        createdAt: c.createdAt
      }))
    };
    const result = await apiRequest('/api/v1/children/link-local', 'POST', payload);
    const linked = (result && result.linkedChildren) || [];
    const map = carregarJSON(CHAVE_VINCULOS, {});

    linked.forEach(item => {
      const idx = pendentes.findIndex(p => p.localChildKey === item.localChildKey);
      if (idx >= 0) pendentes[idx].synced = true;
      map[item.localChildKey] = { criancaId: item.criancaId, responsavelId: sessao.responsavelId };
    });

    salvarJSON(CHAVE_VINCULOS, map);
    salvarJSON(CHAVE_CRIANCAS_PENDENTES, pendentes);
  }

  // Avatar
  document.querySelectorAll('.avatar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.avatar-btn').forEach(b => {
        b.classList.remove('ativo');
        b.setAttribute('aria-pressed', 'false');
      });
  
      btn.classList.add('ativo');
      btn.setAttribute('aria-pressed', 'true');
  
      perfil.avatar = btn.dataset.av;
    });
  });

  // Faixa etária
  document.querySelectorAll('#faixa-grupo .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#faixa-grupo .chip').forEach(b => {
        b.classList.remove('ativo');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('ativo');
      btn.setAttribute('aria-pressed', 'true');
      perfil.faixa = parseInt(btn.dataset.faixa);
    });
  });

  // Gênero favorito
  document.querySelectorAll('#genero-grupo .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#genero-grupo .chip').forEach(b => {
        b.classList.remove('ativo');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('ativo');
      btn.setAttribute('aria-pressed', 'true');
      perfil.genero = btn.dataset.genero;
    });
  });

  // Botão iniciar
  document.getElementById('btn-iniciar').addEventListener('click', tentarEntrar);
  document.getElementById('input-nome').addEventListener('keydown', e => {
    if (e.key === 'Enter') tentarEntrar();
  });

  function tentarEntrar() {
    const nome   = document.getElementById('input-nome').value.trim();
    const erroEl = document.getElementById('erro-nome');

    if (!nome) {
      erroEl.classList.remove('oculto');
      document.getElementById('input-nome').focus();
      return;
    }
    erroEl.classList.add('oculto');
    perfil.nome = nome;

    // Salva perfil temporário (sem portaoAprovado ainda)
    let estadoExistente = {};
    try {
      const raw = localStorage.getItem(CHAVE_ESTADO);
      if (raw) estadoExistente = JSON.parse(raw);
    } catch (_) {}

    // Remove aprovação anterior ao trocar de perfil
    delete estadoExistente.portaoAprovado;
    const pendente = registrarCriancaPendente(perfil);
    perfil.localChildKey = pendente.localChildKey;
    const estadoFinal = Object.assign({}, estadoExistente, { perfil });
    localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estadoFinal));

    // Animação de saída do card de login, depois abre o portão
    document.querySelector('.login-card').style.animation = 'slideUp .28s ease reverse forwards';
    setTimeout(() => abrirPortao(), 250);
  }


  /* ─────────────────────────────────────────
     PARTE 2 — PORTÃO PARENTAL
  ───────────────────────────────────────── */

  const MAX_TENTATIVAS = 3;
  const BLOQUEIO_SEG   = 30;
  let contaAtual  = null;
  let tentativas  = 0;

  // Operações adultas — adição, subtração, multiplicação e divisão
  const OPERACOES = [
    () => { const a = rnd(1, 30), b = rnd(1, 30); return { eq: `${a} + ${b} = ?`, res: a + b }; },
    () => { const a = rnd(5, 30), b = rnd(1, a); return { eq: `${a} − ${b} = ?`, res: a - b }; },
    () => { const a = rnd(4,12),  b = rnd(3,9);  return { eq: `${a} × ${b} = ?`,   res: a * b }; },
    () => { const a = rnd(6,15),  b = rnd(4,12); return { eq: `${a} × ${b} = ?`,   res: a * b }; },
    () => { const a = rnd(8,12),  b = rnd(2,10); return { eq: `${a} × ${b} = ?`,   res: a * b }; },
    () => { const b = rnd(2,10),  r = rnd(3,12); return { eq: `${b*r} ÷ ${b} = ?`, res: r     }; },
    () => { const b = rnd(3,10),  r = rnd(2,12); return { eq: `${b*r} ÷ ${b} = ?`, res: r     }; },
  ];
  function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function gerarConta() {
    const op = OPERACOES[Math.floor(Math.random() * OPERACOES.length)];
    contaAtual = op();
    document.getElementById('pg-equacao').textContent = contaAtual.eq;
    document.getElementById('pg-input').value = '';
    esconderFeedback();
    document.getElementById('pg-input').focus();
  }

  function abrirPortao() {
    // Preenche badge com dados da criança
    document.getElementById('pg-avatar').innerHTML =`<img src="${perfil.avatar}" alt="Avatar">`;
    document.getElementById('pg-nome-crianca').textContent = perfil.nome;

    // Verifica bloqueio ativo
    if (verificarBloqueioAtivo()) {
      mostrarEstado('bloqueio');
    } else {
      tentativas = 0;
      atualizarDots();
      gerarConta();
      mostrarEstado('form');
    }

    // Exibe overlay
    const overlay = document.getElementById('portao-overlay');
    overlay.classList.add('visivel');
    setTimeout(() => document.getElementById('pg-input').focus(), 400);
  }

  // Teclado virtual
  document.querySelectorAll('.pg-tecla').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('pg-input');
      const v = btn.dataset.val;
      if (v === 'del') {
        input.value = input.value.slice(0, -1);
      } else {
        if (input.value.length < 4) input.value += v;
      }
    });
  });

  // Enter no input
  document.getElementById('pg-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmarPortao();
  });

  // Botão confirmar
  document.getElementById('pg-btn-confirmar').addEventListener('click', confirmarPortao);

  // Botão nova conta
  document.getElementById('pg-btn-nova').addEventListener('click', () => {
    tentativas = 0;
    atualizarDots();
    esconderFeedback();
    gerarConta();
  });

  // Botão voltar (trocar perfil)
  document.getElementById('pg-btn-voltar').addEventListener('click', () => {
    document.getElementById('portao-overlay').classList.remove('visivel');
    // Limpa perfil do localStorage
    try {
      const raw = localStorage.getItem(CHAVE_ESTADO);
      if (raw) {
        const d = JSON.parse(raw);
        delete d.perfil;
        delete d.portaoAprovado;
        localStorage.setItem(CHAVE_ESTADO, JSON.stringify(d));
      }
    } catch (_) {}
    // Restaura card de login
    document.querySelector('.login-card').style.animation = '';
    document.getElementById('input-nome').value = '';
    document.getElementById('input-nome').focus();
  });

  function confirmarPortao() {
    const input = document.getElementById('pg-input');
    const resp  = parseInt(input.value.trim(), 10);

    if (isNaN(resp) || input.value.trim() === '') {
      mostrarFeedback('erro', '✏️', 'Digite um número antes de confirmar!');
      input.classList.add('pg-erro');
      setTimeout(() => input.classList.remove('pg-erro'), 700);
      return;
    }

    if (resp === contaAtual.res) {
      // ✅ Correto — marca aprovação e redireciona
      input.classList.add('pg-acerto');
      mostrarFeedback('ok', '✅', `Correto! Bem-vindo, ${perfil.nome}!`);

      // Salva flag de portão aprovado
      try {
        const raw  = localStorage.getItem(CHAVE_ESTADO);
        const dado = raw ? JSON.parse(raw) : {};
        dado.portaoAprovado = true;
        localStorage.setItem(CHAVE_ESTADO, JSON.stringify(dado));
      } catch (_) {}

      setTimeout(() => {
        mostrarEstado('sucesso');
        requestAnimationFrame(() => {
          document.getElementById('pg-barra').style.width = '100%';
        });
        setTimeout(() => { posPortaoFlow(); }, 450);
      }, 600);

    } else {
      // ❌ Errado
      tentativas++;
      try {
        const s = carregarJSON(CHAVE_ESTADO, {});
        s.tentativasReprovadas = (s.tentativasReprovadas || 0) + 1;
        salvarJSON(CHAVE_ESTADO, s);
      } catch (_) {}
      input.classList.add('pg-erro');
      setTimeout(() => { input.classList.remove('pg-erro'); input.value = ''; }, 700);
      atualizarDots();

      if (tentativas >= MAX_TENTATIVAS) {
        const ate = Date.now() + BLOQUEIO_SEG * 1000;
        try { localStorage.setItem('portao_bloqueio', JSON.stringify({ ate })); } catch (_) {}
        mostrarEstado('bloqueio');
        iniciarCountdown(BLOQUEIO_SEG);
      } else {
        const restam = MAX_TENTATIVAS - tentativas;
        mostrarFeedback('erro', '❌', `Resposta errada! Ainda ${restam} tentativa${restam > 1 ? 's' : ''}.`);
        gerarConta();
        input.focus();
      }
    }
  }

  // ── Dots de tentativas ──
  function atualizarDots() {
    for (let i = 1; i <= MAX_TENTATIVAS; i++) {
      document.getElementById(`pg-dot-${i}`)
        ?.classList.toggle('usada', i <= tentativas);
    }
  }

  // ── Controla qual estado mostra no card ──
  function mostrarEstado(estado) {
    document.getElementById('pg-form').style.display = estado === 'form' ? '' : 'none';
    document.getElementById('pg-sucesso').classList.toggle('visivel', estado === 'sucesso');
    document.getElementById('pg-bloqueio').classList.toggle('visivel', estado === 'bloqueio');
  }

  // ── Feedback inline ──
  function mostrarFeedback(tipo, icon, msg) {
    const el  = document.getElementById('pg-feedback');
    const cls = tipo === 'ok' ? 'pg-fb-ok' : 'pg-fb-erro';
    el.className = `pg-feedback visivel ${cls}`;
    document.getElementById('pg-fb-icon').textContent  = icon;
    document.getElementById('pg-fb-texto').textContent = msg;
  }
  function esconderFeedback() {
    document.getElementById('pg-feedback').className = 'pg-feedback';
  }

  // ── Verifica bloqueio no localStorage ──
  function verificarBloqueioAtivo() {
    try {
      const raw = localStorage.getItem('portao_bloqueio');
      if (!raw) return false;
      const { ate } = JSON.parse(raw);
      if (Date.now() < ate) {
        iniciarCountdown(Math.ceil((ate - Date.now()) / 1000));
        return true;
      }
      localStorage.removeItem('portao_bloqueio');
    } catch (_) {}
    return false;
  }

  // ── Countdown do bloqueio ──
  function iniciarCountdown(segundos) {
    const timerEl = document.getElementById('pg-timer');
    let restam = segundos;

    function tick() {
      const m = String(Math.floor(restam / 60)).padStart(2, '0');
      const s = String(restam % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
    }
    tick();

    const iv = setInterval(() => {
      restam--;
      tick();
      if (restam <= 0) {
        clearInterval(iv);
        localStorage.removeItem('portao_bloqueio');
        tentativas = 0;
        atualizarDots();
        gerarConta();
        mostrarEstado('form');
      }
    }, 1000);
  }

  /* ─────────────────────────────────────────
     PARTE 3 — RESPONSÁVEL + PERFIS
  ───────────────────────────────────────── */

  function mostrarCard(id) {
    ['.login-card', '#responsavel-card', '#perfis-card'].forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      if (sel === id) el.classList.remove('oculto');
      else el.classList.add('oculto');
    });
  }

  function getSessaoResponsavel() {
    return carregarJSON(CHAVE_SESSAO, null);
  }

  function getContas() {
    return carregarJSON(CHAVE_CONTAS, { responsaveis: [] });
  }

  function salvarContas(contas) {
    salvarJSON(CHAVE_CONTAS, contas);
  }

  function posPortaoFlow() {
    // Fecha o overlay do portão para liberar telas seguintes
    const overlay = document.getElementById('portao-overlay');
    if (overlay) overlay.classList.remove('visivel');
    document.getElementById('pg-barra').style.width = '0%';
    mostrarEstado('form');

    const sessao = getSessaoResponsavel();
    if (!sessao || !sessao.email) {
      configurarCardResponsavel();
      mostrarCard('#responsavel-card');
      return;
    }
    abrirSelecaoPerfis(sessao.email);
  }

  function configurarCardResponsavel() {
    const modoBtns = document.querySelectorAll('#resp-modo .chip');
    const authBox = document.getElementById('resp-auth-box');
    const recuperarBox = document.getElementById('resp-recuperar-box');
    const subtitulo = document.getElementById('resp-subtitulo');
    const btnEsqueciSenha = document.getElementById('btn-esqueci-senha');
    const btnEnviarCodigo = document.getElementById('btn-enviar-codigo');
    const btnResetarSenha = document.getElementById('btn-resetar-senha');
    const btnCancelarReset = document.getElementById('btn-cancelar-reset');
    const erro = document.getElementById('resp-erro');

    function alternarRecuperacao(visivel) {
      if (!recuperarBox || !authBox) return;
      authBox.classList.toggle('oculto', visivel);
      recuperarBox.classList.toggle('oculto', !visivel);
      if (subtitulo) {
        subtitulo.textContent = visivel
          ? 'Redefina sua senha para voltar ao login.'
          : 'Faça login/cadastro para continuar.';
      }
    }

    function setErro(msg) {
      if (!msg) {
        erro.textContent = '';
        erro.classList.add('oculto');
        return;
      }
      erro.textContent = msg;
      erro.classList.remove('oculto');
    }

    btnEsqueciSenha.onclick = () => {
      alternarRecuperacao(true);
      setErro('');
    };
    btnCancelarReset.onclick = () => {
      alternarRecuperacao(false);
      setErro('');
    };

    btnEnviarCodigo.onclick = async () => {
      const email = document.getElementById('resp-email-reset').value.trim().toLowerCase();
      if (!email) {
        setErro('Digite o e-mail para recuperar a senha.');
        return;
      }
      try {
        await apiRequest('/api/v1/parents/forgot-password', 'POST', { email });
        setErro('Código enviado (se o e-mail estiver cadastrado). Verifique sua caixa de entrada.');
      } catch (e) {
        setErro(e.message || 'Não foi possível enviar o código.');
      }
    };

    btnResetarSenha.onclick = async () => {
      const email = document.getElementById('resp-email-reset').value.trim().toLowerCase();
      const codigo = document.getElementById('resp-codigo-reset').value.trim();
      const novaSenha = document.getElementById('resp-nova-senha').value.trim();
      if (!email || !codigo || !novaSenha) {
        setErro('Preencha e-mail, código e nova senha.');
        return;
      }
      try {
        await apiRequest('/api/v1/parents/reset-password', 'POST', { email, codigo, novaSenha });
        const contas = getContas();
        const localResp = contas.responsaveis.find(r => r.email === email);
        if (localResp) {
          localResp.senha = novaSenha;
          salvarContas(contas);
        }
        document.getElementById('resp-email').value = email;
        document.getElementById('resp-email-reset').value = '';
        document.getElementById('resp-codigo-reset').value = '';
        document.getElementById('resp-nova-senha').value = '';
        document.getElementById('resp-senha').value = '';
        responsavelModo = 'login';
        modoBtns.forEach(b => {
          const ativo = b.dataset.modo === 'login';
          b.classList.toggle('ativo', ativo);
          b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
        });
        alternarRecuperacao(false);
        setErro('Senha redefinida com sucesso. Agora faça login.');
      } catch (e) {
        setErro(e.message || 'Não foi possível redefinir a senha.');
      }
    };

    modoBtns.forEach(btn => {
      btn.onclick = () => {
        modoBtns.forEach(b => { b.classList.remove('ativo'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('ativo');
        btn.setAttribute('aria-pressed', 'true');
        responsavelModo = btn.dataset.modo;
        alternarRecuperacao(false);
      };
    });
    document.getElementById('btn-resp-continuar').onclick = async () => {
      const nome = document.getElementById('resp-nome').value.trim();
      const sobrenome = document.getElementById('resp-sobrenome').value.trim();
      const email = document.getElementById('resp-email').value.trim().toLowerCase();
      const senha = document.getElementById('resp-senha').value.trim();
      const contas = getContas();
      if (!email || !senha || (responsavelModo === 'cadastro' && !nome)) {
        setErro('Preencha os campos obrigatórios.');
        return;
      }
      const existente = contas.responsaveis.find(r => r.email === email);
      try {
        let sessaoApi = null;
        if (responsavelModo === 'cadastro') {
          if (existente) {
            setErro('E-mail já cadastrado.');
            return;
          }
          contas.responsaveis.push({ nome, sobrenome, email, senha, perfis: [] });
          salvarContas(contas);
          sessaoApi = await apiRequest('/api/v1/parents/register', 'POST', { nome, sobrenome, email, senha });
        } else {
          if (!existente || existente.senha !== senha) {
            setErro('E-mail ou senha inválidos.');
            return;
          }
          sessaoApi = await apiRequest('/api/v1/parents/login', 'POST', { email, senha });
        }

        const sessao = { email, em: Date.now(), responsavelId: sessaoApi.responsavelId };
        setErro('');
        salvarJSON(CHAVE_SESSAO, sessao);
        await sincronizarCriancasPendentes(sessao);
        abrirSelecaoPerfis(email);
      } catch (e) {
        setErro(e.message || 'Falha ao conectar com a API.');
      }
    };
  }

  function abrirSelecaoPerfis(email) {
    const contas = getContas();
    const resp = contas.responsaveis.find(r => r.email === email);
    if (!resp) {
      localStorage.removeItem(CHAVE_SESSAO);
      mostrarCard('#responsavel-card');
      return;
    }
    mostrarCard('#perfis-card');
    const lista = document.getElementById('perfis-lista');
    const erroPerfisId = 'perfis-erro';
    let erroPerfis = document.getElementById(erroPerfisId);
    if (!erroPerfis) {
      erroPerfis = document.createElement('span');
      erroPerfis.id = erroPerfisId;
      erroPerfis.className = 'campo-erro oculto';
      document.getElementById('perfis-card').appendChild(erroPerfis);
    }
    erroPerfis.classList.add('oculto');
    erroPerfis.textContent = '';
    lista.innerHTML = '';
    (resp.perfis || []).forEach((p, idx) => {
      const btn = document.createElement('button');
      btn.className = 'avatar-btn';
      btn.innerHTML = `<img src="${p.avatar}" alt="Avatar" class="avatar-img">
        <small style="display:block;font-size:.7rem">${p.nome}</small>`;
      btn.addEventListener('click', () => entrarComPerfil(resp, idx));
      lista.appendChild(btn);
    });
    document.getElementById('btn-add-crianca').onclick = () => {
      if (!perfil.nome) return;
      const nomeNovo = perfil.nome.trim().toLowerCase();
      const avatarNovo = perfil.avatar;
      const duplicado = (resp.perfis || []).some((p) =>
        String(p.nome || '').trim().toLowerCase() === nomeNovo &&
        String(p.avatar || '') === avatarNovo
      );
      if (duplicado) {
        erroPerfis.textContent = 'Já existe um perfil com o mesmo nome e avatar nesta conta.';
        erroPerfis.classList.remove('oculto');
        return;
      }
      const novo = Object.assign({}, perfil);
      resp.perfis = resp.perfis || [];
      resp.perfis.push(novo);
      salvarContas(contas);
      abrirSelecaoPerfis(email);
    };
    document.getElementById('btn-logout-resp').onclick = () => {
      const ok = confirm('Deseja realmente sair da conta do responsável?');
      if (!ok) return;
      localStorage.removeItem(CHAVE_SESSAO);
      const d = carregarJSON(CHAVE_ESTADO, {});
      delete d.portaoAprovado;
      salvarJSON(CHAVE_ESTADO, d);
      window.location.reload();
    };
  }

  function entrarComPerfil(resp, perfilIdx) {
    const p = (resp.perfis || [])[perfilIdx];
    if (!p) return;
    const estado = carregarJSON(CHAVE_ESTADO, {});
    estado.perfil = p;
    estado.portaoAprovado = true;
    salvarJSON(CHAVE_ESTADO, estado);
    window.location.href = 'index.html';
  }


  /* ─────────────────────────────────────────
     PARTE 4 — AUTO-REDIRECT / RETORNO
     Se já tem perfil salvo, abre portão direto
  ───────────────────────────────────────── */
  try {
    const raw = localStorage.getItem(CHAVE_ESTADO);
    if (raw) {
      const dados = JSON.parse(raw);
      if (dados.perfil && dados.perfil.nome) {
        Object.assign(perfil, dados.perfil);
        // Se portão já aprovado, segue fluxo de responsável/perfis
        if (dados.portaoAprovado) {
          const sessao = getSessaoResponsavel();
          if (sessao && sessao.email) abrirSelecaoPerfis(sessao.email);
          else configurarCardResponsavel(), mostrarCard('#responsavel-card');
        } else {
          // Abre portão automaticamente
          abrirPortao();
        }
      }
    }
  } catch (_) {}

})();