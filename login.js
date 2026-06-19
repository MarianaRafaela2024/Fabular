/* =============================================
   login.js — Login da criança + responsável/perfis
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

    let estadoExistente = {};
    try {
      const raw = localStorage.getItem(CHAVE_ESTADO);
      if (raw) estadoExistente = JSON.parse(raw);
    } catch (_) {}

    const pendente = registrarCriancaPendente(perfil);
    perfil.localChildKey = pendente.localChildKey;
    const estadoFinal = Object.assign({}, estadoExistente, { perfil });
    localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estadoFinal));

    document.getElementById('crianca-card').style.animation = 'slideUp .28s ease reverse forwards';
    setTimeout(() => finalizarCadastroCrianca(), 250);
  }


  /* ─────────────────────────────────────────
     PARTE 2 — RESPONSÁVEL + PERFIS
  ───────────────────────────────────────── */

  function mostrarCard(id) {
    ['#crianca-card', '#responsavel-card', '#perfis-card'].forEach(sel => {
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

  async function finalizarCadastroCrianca() {
    const sessao = getSessaoResponsavel();
    if (!sessao || !sessao.email) {
      configurarCardResponsavel();
      mostrarCard('#responsavel-card');
      return;
    }

    const contas = getContas();
    const resp = contas.responsaveis.find(r => r.email === sessao.email);
    if (!resp) {
      localStorage.removeItem(CHAVE_SESSAO);
      configurarCardResponsavel();
      mostrarCard('#responsavel-card');
      return;
    }

    const nomeNovo = perfil.nome.trim().toLowerCase();
    const avatarNovo = perfil.avatar;
    const duplicado = (resp.perfis || []).some((p) =>
      String(p.nome || '').trim().toLowerCase() === nomeNovo &&
      String(p.avatar || '') === avatarNovo
    );
    if (!duplicado) {
      const novo = Object.assign({}, perfil);
      resp.perfis = resp.perfis || [];
      resp.perfis.push(novo);
      salvarContas(contas);
    }

    try {
      await sincronizarCriancasPendentes(sessao);
    } catch (_) {}

    const estado = carregarJSON(CHAVE_ESTADO, {});
    estado.perfil = Object.assign({}, perfil);
    salvarJSON(CHAVE_ESTADO, estado);

    window.location.href = 'index.html';
  }

  function configurarCardResponsavel() {
    const authBox = document.getElementById('resp-auth-box');
    const recuperarBox = document.getElementById('resp-recuperar-box');
    const btnEsqueciSenha = document.getElementById('btn-esqueci-senha');
    const btnEnviarCodigo = document.getElementById('btn-enviar-codigo');
    const btnResetarSenha = document.getElementById('btn-resetar-senha');
    const btnCancelarReset = document.getElementById('btn-cancelar-reset');
    const erro = document.getElementById('resp-erro');
    const camposCadastro = document.getElementById('resp-campos-cadastro');
    const campoConfirmarSenha = document.getElementById('resp-campo-confirmar-senha');
    const linkAlternar = document.getElementById('resp-link-alterar');
    const linkEsqueci = document.getElementById('resp-link-esqueci');
    const titulo = document.getElementById('resp-titulo');

    function atualizarCamposPorModo() {
      const isCadastro = responsavelModo === 'cadastro';
      camposCadastro.classList.toggle('oculto', !isCadastro);
      campoConfirmarSenha.classList.toggle('oculto', !isCadastro);
      if (linkEsqueci) linkEsqueci.classList.toggle('oculto', isCadastro);
      if (titulo) titulo.textContent = isCadastro ? '📝 Criar conta' : '👤 Entrar';
      if (linkAlternar) {
        if (isCadastro) {
          linkAlternar.innerHTML = 'Já tem uma conta? <button class="link-inline" id="btn-ir-login" type="button">Entrar</button>';
          document.getElementById('btn-ir-login').onclick = () => { responsavelModo = 'login'; atualizarCamposPorModo(); setErro(''); };
        } else {
          linkAlternar.innerHTML = 'Não tem uma conta? <button class="link-inline" id="btn-ir-cadastro" type="button">Criar conta</button>';
          document.getElementById('btn-ir-cadastro').onclick = () => { responsavelModo = 'cadastro'; atualizarCamposPorModo(); setErro(''); };
        }
      }
    }
    atualizarCamposPorModo();

    function alternarRecuperacao(visivel) {
      if (!recuperarBox || !authBox) return;
      authBox.classList.toggle('oculto', visivel);
      recuperarBox.classList.toggle('oculto', !visivel);
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
        alternarRecuperacao(false);
        atualizarCamposPorModo();
        setErro('Senha redefinida com sucesso. Agora faça login.');
      } catch (e) {
        setErro(e.message || 'Não foi possível redefinir a senha.');
      }
    };
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
      if (responsavelModo === 'cadastro') {
        const confirmar = document.getElementById('resp-confirmar-senha').value.trim();
        if (senha !== confirmar) {
          setErro('As senhas não coincidem.');
          return;
        }
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
      erroPerfis.classList.add('oculto');
      erroPerfis.textContent = '';
      perfil.nome = '';
      perfil.avatar = 'midia/lion.png';
      perfil.faixa = 1;
      perfil.genero = 'narrativo';
      document.getElementById('input-nome').value = '';
      document.getElementById('erro-nome').classList.add('oculto');
      document.querySelectorAll('#avatar-grid .avatar-btn').forEach(b => {
        const ativo = b.dataset.av === 'midia/lion.png';
        b.classList.toggle('ativo', ativo);
        b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      });
      document.querySelectorAll('#faixa-grupo .chip').forEach(b => {
        const ativo = b.dataset.faixa === '1';
        b.classList.toggle('ativo', ativo);
        b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      });
      document.querySelectorAll('#genero-grupo .chip').forEach(b => {
        const ativo = b.dataset.genero === 'narrativo';
        b.classList.toggle('ativo', ativo);
        b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      });
      document.getElementById('crianca-card').style.animation = '';
      mostrarCard('#crianca-card');
      document.getElementById('input-nome').focus();
    };
    document.getElementById('btn-logout-resp').onclick = () => {
      const ok = confirm('Deseja realmente sair da conta do responsável?');
      if (!ok) return;
      localStorage.removeItem(CHAVE_SESSAO);
      const d = carregarJSON(CHAVE_ESTADO, {});
      delete d.perfil;
      salvarJSON(CHAVE_ESTADO, d);
      configurarCardResponsavel();
      mostrarCard('#responsavel-card');
    };
  }

  function entrarComPerfil(resp, perfilIdx) {
    const p = (resp.perfis || [])[perfilIdx];
    if (!p) return;
    const estado = carregarJSON(CHAVE_ESTADO, {});
    estado.perfil = p;
    salvarJSON(CHAVE_ESTADO, estado);
    window.location.href = 'index.html';
  }


  /* ─────────────────────────────────────────
     PARTE 3 — INICIALIZAÇÃO
     Responsável primeiro; perfis se já logado
  ───────────────────────────────────────── */
  configurarCardResponsavel();

  document.getElementById('btn-voltar-perfis').addEventListener('click', () => {
    const sessao = getSessaoResponsavel();
    if (sessao && sessao.email) abrirSelecaoPerfis(sessao.email);
    else mostrarCard('#responsavel-card');
  });

  const sessaoInicial = getSessaoResponsavel();
  if (sessaoInicial && sessaoInicial.email) {
    abrirSelecaoPerfis(sessaoInicial.email);
  } else {
    mostrarCard('#responsavel-card');
  }

})();