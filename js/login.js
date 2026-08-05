/* =============================================
   login.js — Login da criança + responsável/perfis
   ============================================= */
'use strict';

(function () {

  /* ─────────────────────────────────────────
     PARTE 1 — PERFIL DA CRIANÇA
  ───────────────────────────────────────── */

  const perfil = { nome: '', avatar: '🦁', faixa: 1, genero: 'narrativo', dataNascimento: null, horarioBrincar: null };
  const CHAVE_ESTADO = 'mundoHistorias_estado';
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

  async function apiRequest(path, method = 'GET', body = null) {
    const options = {
      method: method.toUpperCase()
    };
    if (body !== null && body !== undefined) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }
    const resp = await fetch(`${API_BASE}${path}`, options);
    if (!resp.ok) {
      let msg = `Erro ${resp.status}`;
      try {
        const data = await resp.json();
        if (data && data.message) msg = data.message;
      } catch (_) { }
      throw new Error(msg);
    }
    return resp.json();
  }

  async function carregarCriancas(responsavelId) {
    if (!responsavelId || isNaN(Number(responsavelId))) return [];
    try {
      const data = await apiRequest(
        `/api/v1/children?responsavelId=${encodeURIComponent(responsavelId)}`,
        "GET"
      );
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('Falha ao carregar crianças da API (retornando lista vazia):', e);
      return [];
    }
  }

  function criarLocalChildKey(perf) {
    const base = `${String(perf.nome || '').trim().toLowerCase()}-${String(perf.avatar || '')}-${Date.now()}`;
    return base.replace(/\s+/g, '-');
  }

  function registrarCriancaPendente(perf) {
    const perfilNormalizado = typeof normalizarPerfilCrianca === 'function'
      ? normalizarPerfilCrianca(perf)
      : Object.assign({}, perf);

    const pendentes = carregarJSON(CHAVE_CRIANCAS_PENDENTES, []);
    const novo = {
      localChildKey: perf.localChildKey || criarLocalChildKey(perfilNormalizado),
      nome: perfilNormalizado.nome,
      faixaEtaria: perfilNormalizado.faixa || perfilNormalizado.faixaEtaria || 1,
      dataNascimento: perfilNormalizado.dataNascimento || null,
      avatar: perfilNormalizado.avatar || '🦁',
      generoFavorito: perfilNormalizado.genero || perfilNormalizado.generoFavorito || 'narrativo',
      horarioBrincar: perfilNormalizado.horarioBrincar || null,
      createdAt: new Date().toISOString(),
      synced: false
    };

    // Evita duplicar pendente idêntico
    const idx = pendentes.findIndex(p => p.localChildKey === novo.localChildKey || (p.nome === novo.nome && p.avatar === novo.avatar));
    if (idx >= 0) {
      pendentes[idx] = Object.assign({}, pendentes[idx], novo);
    } else {
      pendentes.push(novo);
    }

    salvarJSON(CHAVE_CRIANCAS_PENDENTES, pendentes);
    return novo;
  }

  async function sincronizarCriancasPendentes(sessao) {
    if (!sessao || !sessao.responsavelId) return;
    const pendentes = carregarJSON(CHAVE_CRIANCAS_PENDENTES, []);
    if (!pendentes.length) return;
    const naoSincronizados = pendentes.filter(c => !c.synced);
    if (!naoSincronizados.length) return;

    const payload = {
      responsavelId: Number(sessao.responsavelId),
      childrenLocal: naoSincronizados.map(c => ({
        localChildKey: c.localChildKey,
        nome: c.nome,
        faixaEtaria: Number(c.faixaEtaria || 1),
        dataNascimento: c.dataNascimento || null,
        avatar: c.avatar || '🦁',
        generoFavorito: c.generoFavorito || 'narrativo',
        horarioBrincar: c.horarioBrincar || null,
        createdAt: c.createdAt || new Date().toISOString()
      }))
    };

    try {
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
    } catch (e) {
      console.warn('Sincronização de crianças pendentes falhou:', e);
    }
  }

  // Seleção de Avatar
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

  // Botão iniciar perfil da criança
  const btnIniciar = document.getElementById('btn-iniciar');
  if (btnIniciar) btnIniciar.addEventListener('click', tentarEntrar);

  const inputNome = document.getElementById('input-nome');
  if (inputNome) {
    inputNome.addEventListener('keydown', e => {
      if (e.key === 'Enter') tentarEntrar();
    });
  }

  function atualizarPreviewFaixa() {
    const preview = document.getElementById('faixa-preview');
    const inputNascimento = document.getElementById('input-nascimento');
    if (!preview || !inputNascimento) return;
    const data = inputNascimento.value;
    if (!data) {
      preview.textContent = '';
      return;
    }
    const faixa = typeof calcularFaixaEtaria === 'function' ? calcularFaixaEtaria(data) : 1;
    const label = typeof labelFaixaEtaria === 'function' ? labelFaixaEtaria(faixa) : `Faixa ${faixa}`;
    preview.textContent = `Faixa etária: ${label}`;
  }

  const inputNasc = document.getElementById('input-nascimento');
  if (inputNasc) {
    inputNasc.addEventListener('change', atualizarPreviewFaixa);
    inputNasc.addEventListener('input', atualizarPreviewFaixa);
    inputNasc.max = new Date().toISOString().slice(0, 10);
  }

  function tentarEntrar() {
    const nome = document.getElementById('input-nome').value.trim();
    const dataNascimento = document.getElementById('input-nascimento').value;
    const erroEl = document.getElementById('erro-nome');
    const erroNascimento = document.getElementById('erro-nascimento');

    if (!nome) {
      if (erroEl) erroEl.classList.remove('oculto');
      document.getElementById('input-nome').focus();
      return;
    }
    if (erroEl) erroEl.classList.add('oculto');

    if (!dataNascimento) {
      if (erroNascimento) erroNascimento.classList.remove('oculto');
      document.getElementById('input-nascimento').focus();
      return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const nasc = new Date(dataNascimento + 'T12:00:00');
    if (nasc > hoje) {
      if (erroNascimento) {
        erroNascimento.textContent = 'A data de nascimento não pode ser no futuro.';
        erroNascimento.classList.remove('oculto');
      }
      document.getElementById('input-nascimento').focus();
      return;
    }
    if (erroNascimento) {
      erroNascimento.classList.add('oculto');
      erroNascimento.textContent = 'Informe a data de nascimento.';
    }

    perfil.nome = nome;
    perfil.dataNascimento = dataNascimento;
    perfil.faixa = typeof calcularFaixaEtaria === 'function' ? calcularFaixaEtaria(dataNascimento) : 1;
    const inputHorario = document.getElementById('input-horario');
    perfil.horarioBrincar = inputHorario ? inputHorario.value || null : null;

    let estadoExistente = {};
    try {
      const raw = localStorage.getItem(CHAVE_ESTADO);
      if (raw) estadoExistente = JSON.parse(raw);
    } catch (_) { }

    const pendente = registrarCriancaPendente(perfil);
    perfil.localChildKey = pendente.localChildKey;
    const estadoFinal = Object.assign({}, estadoExistente, { perfil });
    localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estadoFinal));

    const card = document.getElementById('crianca-card');
    if (card) card.style.animation = 'slideUp .28s ease reverse forwards';
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

  async function finalizarCadastroCrianca() {
    const sessao = getSessaoResponsavel();
    if (!sessao || !sessao.email || !sessao.responsavelId) {
      configurarCardResponsavel();
      mostrarCard('#responsavel-card');
      return;
    }

    // Garante que o perfil atual está registrado localmente
    registrarCriancaPendente(perfil);

    // Tenta sincronizar com o backend
    if (sessao.responsavelId) {
      try {
        await sincronizarCriancasPendentes(sessao);
      } catch (err) {
        console.warn('Erro ao sincronizar crianças pendentes:', err);
      }
    }

    const estado = carregarJSON(CHAVE_ESTADO, {});
    const perfilNorm = typeof normalizarPerfilCrianca === 'function'
      ? normalizarPerfilCrianca(Object.assign({}, perfil))
      : Object.assign({}, perfil);

    estado.perfil = perfilNorm;
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
      if (camposCadastro) camposCadastro.classList.toggle('oculto', !isCadastro);
      if (campoConfirmarSenha) campoConfirmarSenha.classList.toggle('oculto', !isCadastro);
      if (linkEsqueci) linkEsqueci.classList.toggle('oculto', isCadastro);
      if (titulo) titulo.textContent = isCadastro ? '📝 Criar conta' : '👤 Entrar';
      if (linkAlternar) {
        if (isCadastro) {
          linkAlternar.innerHTML = 'Já tem uma conta? <button class="link-inline" id="btn-ir-login" type="button">Entrar</button>';
          const btnIrLogin = document.getElementById('btn-ir-login');
          if (btnIrLogin) btnIrLogin.onclick = () => { responsavelModo = 'login'; atualizarCamposPorModo(); setErro(''); };
        } else {
          linkAlternar.innerHTML = 'Não tem uma conta? <button class="link-inline" id="btn-ir-cadastro" type="button">Criar conta</button>';
          const btnIrCad = document.getElementById('btn-ir-cadastro');
          if (btnIrCad) btnIrCad.onclick = () => { responsavelModo = 'cadastro'; atualizarCamposPorModo(); setErro(''); };
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
      if (!erro) return;
      if (!msg) {
        erro.textContent = '';
        erro.classList.add('oculto');
        return;
      }
      erro.textContent = msg;
      erro.classList.remove('oculto');
    }

    if (btnEsqueciSenha) {
      btnEsqueciSenha.onclick = () => {
        alternarRecuperacao(true);
        setErro('');
      };
    }

    if (btnCancelarReset) {
      btnCancelarReset.onclick = () => {
        alternarRecuperacao(false);
        setErro('');
      };
    }

    if (btnEnviarCodigo) {
      btnEnviarCodigo.onclick = async () => {
        const inputEmailReset = document.getElementById('resp-email-reset');
        const email = inputEmailReset ? inputEmailReset.value.trim().toLowerCase() : '';

        if (!email) {
          setErro('Digite seu e-mail.');
          return;
        }

        try {
          setErro('Enviando código...');
          await apiRequest('/api/v1/parents/forgot-password', 'POST', { email });
          setErro('Código enviado com sucesso. Verifique sua caixa de entrada.');
        } catch (e) {
          console.error(e);
          setErro(e.message || 'Não foi possível enviar o código.');
        }
      };
    }

    const btnContinuar = document.getElementById('btn-resp-continuar');
    if (btnContinuar) {
      btnContinuar.onclick = async () => {
        const nomeEl = document.getElementById('resp-nome');
        const sobrenomeEl = document.getElementById('resp-sobrenome');
        const telefoneEl = document.getElementById('resp-telefone');
        const emailEl = document.getElementById('resp-email');
        const senhaEl = document.getElementById('resp-senha');

        const nome = nomeEl ? nomeEl.value.trim() : '';
        const sobrenome = sobrenomeEl ? sobrenomeEl.value.trim() : '';
        const telefone = telefoneEl ? telefoneEl.value.replace(/\D/g, '') : '';
        const email = emailEl ? emailEl.value.trim().toLowerCase() : '';
        const senha = senhaEl ? senhaEl.value.trim() : '';

        if (!email || !senha || (responsavelModo === 'cadastro' && !nome)) {
          setErro('Preencha os campos obrigatórios.');
          return;
        }
        if (responsavelModo === 'cadastro' && telefone.length < 10) {
          setErro('Informe um telefone válido com DDD.');
          return;
        }
        if (responsavelModo === 'cadastro') {
          const confirmarEl = document.getElementById('resp-confirmar-senha');
          const confirmar = confirmarEl ? confirmarEl.value.trim() : '';
          if (senha !== confirmar) {
            setErro('As senhas não coincidem.');
            return;
          }
        }

        try {
          let sessaoApi = null;
          if (responsavelModo === 'cadastro') {
            sessaoApi = await apiRequest('/api/v1/parents/register', 'POST', { nome, sobrenome, telefone, email, senha });
          } else {
            sessaoApi = await apiRequest('/api/v1/parents/login', 'POST', { email, senha });
          }

          const respId = sessaoApi ? (sessaoApi.responsavelId ?? sessaoApi.ResponsavelId ?? sessaoApi.id) : null;
          const sessao = { email, em: Date.now(), responsavelId: respId };
          setErro('');
          salvarJSON(CHAVE_SESSAO, sessao);

          // Sincroniza perfis infantis pendentes após autenticação do responsável
          await sincronizarCriancasPendentes(sessao);
          await abrirSelecaoPerfis();
        } catch (e) {
          console.error('ERRO AUTENTICAÇÃO:', e);
          setErro(e.message || 'Falha ao conectar com a API.');
        }
      };
    }

    if (btnResetarSenha) {
      btnResetarSenha.onclick = async () => {
        const emailEl = document.getElementById('resp-email-reset');
        const codigoEl = document.getElementById('resp-codigo-reset');
        const novaSenhaEl = document.getElementById('resp-nova-senha');

        const email = emailEl ? emailEl.value.trim().toLowerCase() : '';
        const codigo = codigoEl ? codigoEl.value.trim() : '';
        const novaSenha = novaSenhaEl ? novaSenhaEl.value.trim() : '';

        if (!email || !codigo || !novaSenha) {
          setErro('Preencha e-mail, código e nova senha.');
          return;
        }

        try {
          setErro('Redefinindo senha...');
          await apiRequest('/api/v1/parents/reset-password', 'POST', { email, codigo, novaSenha });

          if (document.getElementById('resp-email')) document.getElementById('resp-email').value = email;
          if (emailEl) emailEl.value = '';
          if (codigoEl) codigoEl.value = '';
          if (novaSenhaEl) novaSenhaEl.value = '';
          if (document.getElementById('resp-senha')) document.getElementById('resp-senha').value = '';

          responsavelModo = 'login';
          alternarRecuperacao(false);
          atualizarCamposPorModo();

          setErro('Senha redefinida com sucesso. Agora faça login.');
        } catch (e) {
          console.error(e);
          setErro(e.message || 'Não foi possível redefinir a senha.');
        }
      };
    }
  }

  async function abrirSelecaoPerfis() {
    const sessao = getSessaoResponsavel();

    if (!sessao || !sessao.responsavelId) {
      mostrarCard('#responsavel-card');
      return;
    }

    // 1. Tentar sincronizar crianças pendentes
    await sincronizarCriancasPendentes(sessao);

    // 2. Carregar crianças do servidor API (seguro com fallback interno)
    const perfisApi = await carregarCriancas(sessao.responsavelId);

    // 3. Carregar crianças pendentes para unificação de perfis no frontend
    const pendentes = carregarJSON(CHAVE_CRIANCAS_PENDENTES, []);
    const perfisUnificados = [...perfisApi];

    pendentes.forEach(p => {
      const jaExiste = perfisUnificados.some(apiP =>
        (apiP.localChildKey && apiP.localChildKey === p.localChildKey) ||
        (apiP.nome && p.nome && apiP.nome.trim().toLowerCase() === p.nome.trim().toLowerCase())
      );
      if (!jaExiste) {
        perfisUnificados.push({
          id: p.localChildKey,
          nome: p.nome,
          avatar: p.avatar || '🦁',
          faixaEtaria: p.faixaEtaria || p.faixa || 1,
          dataNascimento: p.dataNascimento || null,
          generoFavorito: p.generoFavorito || p.genero || 'narrativo',
          localChildKey: p.localChildKey,
          horarioBrincar: p.horarioBrincar || null
        });
      }
    });

    mostrarCard('#perfis-card');

    const lista = document.getElementById('perfis-lista');
    if (lista) {
      lista.innerHTML = '';

      if (perfisUnificados.length === 0) {
        const msgVazia = document.createElement('p');
        msgVazia.style.cssText = 'grid-column: 1/-1; text-align: center; color: #666; font-size: 0.9rem; padding: 1rem;';
        msgVazia.textContent = 'Nenhuma criança cadastrada ainda. Clique abaixo para adicionar!';
        lista.appendChild(msgVazia);
      } else {
        perfisUnificados.forEach((p) => {
          const btn = document.createElement('button');
          btn.className = 'avatar-btn';
          btn.type = 'button';
          btn.innerHTML = `
            <span class="avatar-emoji" style="font-size: 2.2rem; display: block; margin-bottom: 0.2rem;">${p.avatar || '🦁'}</span>
            <small style="display:block;font-size:.8rem;font-weight:600;color:#333;">${p.nome}</small>
          `;

          btn.addEventListener('click', () => entrarComPerfil(p));
          lista.appendChild(btn);
        });
      }
    }

    const btnAdd = document.getElementById('btn-add-crianca');
    if (btnAdd) {
      btnAdd.onclick = () => {
        const inputN = document.getElementById('input-nome');
        const inputD = document.getElementById('input-nascimento');
        if (inputN) inputN.value = '';
        if (inputD) inputD.value = '';
        const preview = document.getElementById('faixa-preview');
        if (preview) preview.textContent = '';
        const errNome = document.getElementById('erro-nome');
        if (errNome) errNome.classList.add('oculto');
        const errNasc = document.getElementById('erro-nascimento');
        if (errNasc) errNasc.classList.add('oculto');
        mostrarCard('#crianca-card');
      };
    }

    const btnLogout = document.getElementById('btn-logout-resp');
    if (btnLogout) {
      btnLogout.onclick = () => {
        localStorage.removeItem(CHAVE_SESSAO);
        mostrarCard('#responsavel-card');
      };
    }
  }

  function entrarComPerfil(perfilApi) {
    const estado = carregarJSON(CHAVE_ESTADO, {});
    const perfilObj = {
      id: perfilApi.id || perfilApi.localChildKey,
      nome: perfilApi.nome,
      avatar: perfilApi.avatar,
      genero: perfilApi.generoFavorito || perfilApi.genero,
      dataNascimento: perfilApi.dataNascimento,
      faixa: perfilApi.faixaEtaria || perfilApi.faixa || 1,
      localChildKey: perfilApi.localChildKey,
      horarioBrincar: perfilApi.horarioBrincar
    };

    estado.perfil = typeof normalizarPerfilCrianca === 'function'
      ? normalizarPerfilCrianca(perfilObj)
      : perfilObj;

    salvarJSON(CHAVE_ESTADO, estado);
    window.location.href = "index.html";
  }

  /* ─────────────────────────────────────────
     PARTE 3 — INICIALIZAÇÃO
     Responsável primeiro; perfis se já logado
  ───────────────────────────────────────── */
  configurarCardResponsavel();

  const btnVoltarPerfis = document.getElementById('btn-voltar-perfis');
  if (btnVoltarPerfis) {
    btnVoltarPerfis.addEventListener('click', () => {
      const sessao = getSessaoResponsavel();
      if (sessao && sessao.email && sessao.responsavelId) abrirSelecaoPerfis();
      else mostrarCard('#responsavel-card');
    });
  }

  const sessaoInicial = getSessaoResponsavel();
  if (sessaoInicial && sessaoInicial.email && sessaoInicial.responsavelId) {
    abrirSelecaoPerfis();
  } else {
    mostrarCard('#responsavel-card');
  }

})();
