/* =============================================
   login.js — Login da criança + responsável/perfis
   ============================================= */
'use strict';

(function () {

  /* ─────────────────────────────────────────
     PARTE 1 — PERFIL DA CRIANÇA
  ───────────────────────────────────────── */

  const perfil = { nome: '', avatar: 'midia/lion.png', faixa: 1, genero: 'narrativo', dataNascimento: null, horarioBrincar: null };
  const CHAVE_ESTADO = 'mundoHistorias_estado';
  const CHAVE_SESSAO = 'mundoHistorias_responsavel_sessao';
  const API_BASE = (window.API_BASE_URL || 'http://localhost:5275').replace(/\/$/, '');
  let responsavelModo = 'login';

  // Limpeza proativa de chaves legadas no localStorage para garantir que a lista de crianças não seja mantida localmente
  localStorage.removeItem('mundoHistorias_criancas_pendentes');
  localStorage.removeItem('mundoHistorias_vinculos_crianca');

  // Ao estar na tela de login/seleção de perfil, o tamanho da fonte deve ser o padrão
  try {
    localStorage.removeItem('mundoHistorias_tamanhoFonte');
    document.documentElement.style.fontSize = '';
    document.documentElement.style.removeProperty('--fonte-base');
  } catch (_) {}

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

  async function tentarEntrar() {
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

    const sessao = getSessaoResponsavel();
    if (!sessao || !sessao.responsavelId) {
      configurarCardResponsavel();
      mostrarCard('#responsavel-card');
      return;
    }

    perfil.nome = nome;
    perfil.dataNascimento = dataNascimento;
    perfil.faixa = typeof calcularFaixaEtaria === 'function' ? calcularFaixaEtaria(dataNascimento) : 1;
    const inputHorario = document.getElementById('input-horario');
    perfil.horarioBrincar = inputHorario ? inputHorario.value || null : null;

    try {
      const res = await apiRequest('/api/v1/children', 'POST', {
        responsavelId: Number(sessao.responsavelId),
        nome: perfil.nome,
        faixaEtaria: Number(perfil.faixa),
        dataNascimento: perfil.dataNascimento,
        avatar: perfil.avatar || 'midia/lion.png',
        generoFavorito: perfil.genero || 'narrativo',
        horarioBrincar: perfil.horarioBrincar
      });

      const childId = res ? (res.id ?? res.Id) : null;
      let estadoExistente = {};
      try {
        const raw = localStorage.getItem(CHAVE_ESTADO);
        if (raw) estadoExistente = JSON.parse(raw);
      } catch (_) { }

      const perfilFinal = {
        id: childId,
        nome: perfil.nome,
        avatar: perfil.avatar || 'midia/lion.png',
        genero: perfil.genero || 'narrativo',
        dataNascimento: perfil.dataNascimento,
        faixa: perfil.faixa,
        horarioBrincar: perfil.horarioBrincar
      };

      const perfilNorm = typeof normalizarPerfilCrianca === 'function'
        ? normalizarPerfilCrianca(perfilFinal)
        : perfilFinal;

      const estadoFinal = {
        perfil: perfilNorm,
        vidasPerdidasPorCrianca: estadoExistente.vidasPerdidasPorCrianca || {},
        progressoCriancaId: childId ? Number(childId) : null
      };
      salvarJSON(CHAVE_ESTADO, estadoFinal);

      const card = document.getElementById('crianca-card');
      if (card) card.style.animation = 'slideUp .28s ease reverse forwards';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 250);
    } catch (err) {
      console.error('Erro ao cadastrar criança no banco:', err);
      if (erroNascimento) {
        erroNascimento.textContent = err.message || 'Falha ao cadastrar criança no banco de dados.';
        erroNascimento.classList.remove('oculto');
      }
    }
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

    // Carregar crianças diretamente do banco de dados via API para o responsável logado
    const perfisApi = await carregarCriancas(sessao.responsavelId);

    mostrarCard('#perfis-card');

    const lista = document.getElementById('perfis-lista');
    if (lista) {
      lista.innerHTML = '';

      if (!perfisApi || perfisApi.length === 0) {
        const msgVazia = document.createElement('p');
        msgVazia.style.cssText = 'grid-column: 1/-1; text-align: center; color: #666; font-size: 0.9rem; padding: 1rem;';
        msgVazia.textContent = 'Nenhuma criança cadastrada ainda. Clique abaixo para adicionar!';
        lista.appendChild(msgVazia);
      } else {
        perfisApi.forEach((p) => {
          const btn = document.createElement('button');
          btn.className = 'avatar-btn';
          btn.type = 'button';
          const avatarHtml = typeof renderizarAvatarHTML === 'function'
            ? renderizarAvatarHTML(p.avatar || p.Avatar || 'midia/lion.png', 'avatar-img')
            : `<span class="avatar-emoji" style="font-size: 2.2rem; display: block; margin-bottom: 0.2rem;">${p.avatar || p.Avatar || '🦁'}</span>`;
          btn.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;margin-bottom:0.2rem;height:48px;">${avatarHtml}</div>
            <small style="display:block;font-size:.8rem;font-weight:600;color:#333;">${p.nome || p.Nome}</small>
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
        localStorage.removeItem(CHAVE_ESTADO);
        try {
          localStorage.removeItem('mundoHistorias_tamanhoFonte');
          document.documentElement.style.fontSize = '';
          document.documentElement.style.removeProperty('--fonte-base');
        } catch (_) {}
        mostrarCard('#responsavel-card');
      };
    }

    const btnConfig = document.getElementById('btn-ir-configuracoes');
    if (btnConfig) {
      btnConfig.onclick = () => {
        window.location.href = 'configuracoes.html';
      };
    }
  }

  function entrarComPerfil(perfilApi) {
    const perfilObj = {
      id: perfilApi.id || perfilApi.Id,
      nome: perfilApi.nome || perfilApi.Nome,
      avatar: perfilApi.avatar || perfilApi.Avatar || 'midia/lion.png',
      genero: perfilApi.generoFavorito || perfilApi.GeneroFavorito || 'narrativo',
      dataNascimento: perfilApi.dataNascimento || perfilApi.DataNascimento,
      faixa: perfilApi.faixaEtaria || perfilApi.FaixaEtaria || 1,
      horarioBrincar: perfilApi.horarioBrincar || perfilApi.HorarioBrincar
    };

    if (typeof trocarPerfilCriancaEstado === 'function') {
      trocarPerfilCriancaEstado(perfilObj);
    } else {
      const perfilNorm = typeof normalizarPerfilCrianca === 'function'
        ? normalizarPerfilCrianca(perfilObj)
        : perfilObj;

      const childId = perfilNorm.id || perfilNorm.Id;
      let estadoCrianca = { perfil: perfilNorm };

      if (childId) {
        const rawC = localStorage.getItem(`mundoHistorias_estado_crianca_${childId}`);
        if (rawC) {
          try {
            const parsedC = JSON.parse(rawC);
            if (parsedC) estadoCrianca = Object.assign({}, parsedC, { perfil: perfilNorm });
          } catch (_) { }
        }
      }

      let estadoExistente = {};
      try {
        const raw = localStorage.getItem(CHAVE_ESTADO);
        if (raw) estadoExistente = JSON.parse(raw);
      } catch (_) { }

      const estadoFinal = {
        perfil: perfilNorm,
        vidasPerdidasPorCrianca: estadoExistente.vidasPerdidasPorCrianca || estadoCrianca.vidasPerdidasPorCrianca || {},
        progressoCriancaId: childId ? Number(childId) : null
      };
      salvarJSON(CHAVE_ESTADO, estadoFinal);
    }

    window.location.href = 'index.html';
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