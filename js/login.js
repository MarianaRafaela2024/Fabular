/* =============================================
   login.js — Login da criança + responsável/perfis
   ============================================= */
'use strict';

(function () {

  /* ─────────────────────────────────────────
     PARTE 1 — PERFIL DA CRIANÇA
  ───────────────────────────────────────── */

  const perfil = { nome: '', avatar: 'midia/user/sapo.png', faixa: 1, genero: 'narrativo', dataNascimento: null, horarioBrincar: null };
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

  const erroHorarioEl = document.getElementById('erro-horario');
  const inputHorarioEl = document.getElementById('input-horario');

  function validarHorarioFormulario(mostrarErro) {
    const V = window.FabularValidacao;
    const resultado = V
      ? V.validarHorarioBrincar(inputHorarioEl && inputHorarioEl.value)
      : { ok: !!(inputHorarioEl && inputHorarioEl.value), mensagem: 'Selecione o horário de brincar', valor: (inputHorarioEl && inputHorarioEl.value) || '' };
    if (mostrarErro && V) V.definirErroCampo(erroHorarioEl, resultado.ok ? '' : resultado.mensagem);
    else if (mostrarErro && erroHorarioEl) {
      erroHorarioEl.textContent = resultado.ok ? '' : resultado.mensagem;
      erroHorarioEl.classList.toggle('oculto', resultado.ok);
    } else if (resultado.ok && V) {
      V.definirErroCampo(erroHorarioEl, '');
    }
    return resultado;
  }

  function formularioCriancaValido() {
    const nome = document.getElementById('input-nome') && document.getElementById('input-nome').value.trim();
    const dataNascimento = document.getElementById('input-nascimento') && document.getElementById('input-nascimento').value;
    return !!(nome && dataNascimento && validarHorarioFormulario(false).ok);
  }

  function atualizarBotaoIniciar() {
    if (window.FabularValidacao) {
      window.FabularValidacao.atualizarBotaoEnviar(btnIniciar, formularioCriancaValido());
    } else if (btnIniciar) {
      btnIniciar.disabled = !formularioCriancaValido();
    }
  }

  if (inputNome) inputNome.addEventListener('input', atualizarBotaoIniciar);
  if (inputNasc) {
    inputNasc.addEventListener('input', atualizarBotaoIniciar);
    inputNasc.addEventListener('change', atualizarBotaoIniciar);
  }
  if (inputHorarioEl) {
    inputHorarioEl.addEventListener('input', () => {
      validarHorarioFormulario(true);
      atualizarBotaoIniciar();
    });
    inputHorarioEl.addEventListener('change', () => {
      validarHorarioFormulario(true);
      atualizarBotaoIniciar();
    });
  }
  atualizarBotaoIniciar();

  async function tentarEntrar() {
    const nome = document.getElementById('input-nome').value.trim();
    const dataNascimento = document.getElementById('input-nascimento').value;
    const erroEl = document.getElementById('erro-nome');
    const erroNascimento = document.getElementById('erro-nascimento');
    const horarioVal = validarHorarioFormulario(true);

    if (!nome) {
      if (erroEl) erroEl.classList.remove('oculto');
      document.getElementById('input-nome').focus();
      atualizarBotaoIniciar();
      return;
    }
    if (erroEl) erroEl.classList.add('oculto');

    if (!dataNascimento) {
      if (erroNascimento) erroNascimento.classList.remove('oculto');
      document.getElementById('input-nascimento').focus();
      atualizarBotaoIniciar();
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

    if (!horarioVal.ok) {
      if (inputHorarioEl) inputHorarioEl.focus();
      atualizarBotaoIniciar();
      return;
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
    perfil.horarioBrincar = horarioVal.valor;

    try {
      const res = await apiRequest('/api/v1/children', 'POST', {
        responsavelId: Number(sessao.responsavelId),
        nome: perfil.nome,
        faixaEtaria: Number(perfil.faixa),
        dataNascimento: perfil.dataNascimento,
        avatar: perfil.avatar || 'midia/user/sapo.png',
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
        avatar: perfil.avatar || 'midia/user/sapo.png',
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
      const msg = err.message || 'Falha ao cadastrar criança no banco de dados.';
      if (window.FabularValidacao && msg.indexOf('horário') !== -1) {
        window.FabularValidacao.definirErroCampo(erroHorarioEl, msg);
        if (inputHorarioEl) inputHorarioEl.focus();
      } else if (erroNascimento) {
        erroNascimento.textContent = msg;
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
      const requisitosEl = document.getElementById('resp-senha-requisitos');
      if (requisitosEl) requisitosEl.classList.toggle('oculto', !isCadastro);
      const senhaCampo = document.getElementById('resp-senha');
      if (senhaCampo) senhaCampo.autocomplete = isCadastro ? 'new-password' : 'current-password';
      if (titulo) titulo.textContent = isCadastro ? 'Criar conta' : 'Entrar';
      if (linkAlternar) {
        if (isCadastro) {
          linkAlternar.innerHTML = 'Já tem uma conta? <button class="link-inline" id="btn-ir-login" type="button">Entrar</button>';
          const btnIrLogin = document.getElementById('btn-ir-login');
          if (btnIrLogin) btnIrLogin.onclick = () => { responsavelModo = 'login'; atualizarCamposPorModo(); setErro(''); atualizarBotaoResp(); };
        } else {
          linkAlternar.innerHTML = 'Não tem uma conta? <button class="link-inline" id="btn-ir-cadastro" type="button">Criar conta</button>';
          const btnIrCad = document.getElementById('btn-ir-cadastro');
          if (btnIrCad) btnIrCad.onclick = () => { responsavelModo = 'cadastro'; atualizarCamposPorModo(); setErro(''); atualizarBotaoResp(); };
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

    const V = window.FabularValidacao;
    const telefoneEl = document.getElementById('resp-telefone');
    const emailEl = document.getElementById('resp-email');
    const nomeEl = document.getElementById('resp-nome');
    const senhaEl = document.getElementById('resp-senha');
    const confirmarEl = document.getElementById('resp-confirmar-senha');
    const erroTelEl = document.getElementById('erro-resp-telefone');
    const erroEmailEl = document.getElementById('erro-resp-email');
    const erroSenhaEl = document.getElementById('erro-resp-senha');
    const erroConfirmarEl = document.getElementById('erro-resp-confirmar-senha');
    const requisitosSenhaEl = document.getElementById('resp-senha-requisitos');
    const btnContinuar = document.getElementById('btn-resp-continuar');

    if (V && telefoneEl) V.aplicarMascaraTelefone(telefoneEl);
    if (V) {
      V.aplicarOlhoSenha(senhaEl);
      V.aplicarOlhoSenha(confirmarEl);
      V.aplicarOlhoSenha(document.getElementById('resp-nova-senha'));
      V.aplicarOlhoSenha(document.getElementById('resp-confirmar-nova-senha'));
    }

    function validarNomeResp(mostrarErro) {
      if (responsavelModo !== 'cadastro') {
        if (V) V.definirErroCampo(document.getElementById('erro-resp-nome'), '');
        return { ok: true, valor: '' };
      }
      const resultado = V
        ? V.validarNome(nomeEl && nomeEl.value)
        : { ok: !!(nomeEl && nomeEl.value.trim().length >= 2), mensagem: 'Informe um nome com pelo menos 2 caracteres.', valor: (nomeEl && nomeEl.value.trim()) || '' };
      if (V) V.definirErroCampo(document.getElementById('erro-resp-nome'), mostrarErro && !resultado.ok ? resultado.mensagem : '');
      return resultado;
    }

    function validarEmailResp(mostrarErro) {
      const resultado = V ? V.validarEmail(emailEl && emailEl.value) : { ok: !!(emailEl && emailEl.value.trim()), mensagem: 'Digite um e-mail válido.', valor: '' };
      if (V) V.definirErroCampo(erroEmailEl, mostrarErro && !resultado.ok ? resultado.mensagem : '');
      return resultado;
    }

    function validarTelefoneResp(mostrarErro) {
      if (responsavelModo !== 'cadastro') {
        if (V) V.definirErroCampo(erroTelEl, '');
        return { ok: true, valor: '' };
      }
      const resultado = V ? V.validarTelefone(telefoneEl && telefoneEl.value) : { ok: false, mensagem: 'Telefone inválido. Use DDD + 9 dígitos.', valor: '' };
      if (V) V.definirErroCampo(erroTelEl, mostrarErro && !resultado.ok ? resultado.mensagem : '');
      return resultado;
    }

    function validarSenhaResp(mostrarErro) {
      const senha = senhaEl ? senhaEl.value : '';
      if (responsavelModo !== 'cadastro') {
        if (V) {
          V.definirErroCampo(erroSenhaEl, '');
          V.definirErroCampo(erroConfirmarEl, '');
        }
        return { ok: !!senha, valor: senha };
      }
      const resultado = V ? V.validarSenha(senha) : { ok: senha.length >= 8, mensagem: '', valor: senha, requisitos: {} };
      if (V) {
        V.atualizarRequisitosSenha(requisitosSenhaEl, resultado.requisitos || V.requisitosSenha(senha));
        V.definirErroCampo(erroSenhaEl, mostrarErro && !resultado.ok ? resultado.mensagem : '');
      }
      const confirmar = confirmarEl ? confirmarEl.value : '';
      const conf = V ? V.validarConfirmacaoSenha(senha, confirmar) : { ok: senha === confirmar, mensagem: 'As senhas não coincidem.' };
      if (V) V.definirErroCampo(erroConfirmarEl, mostrarErro && !conf.ok ? conf.mensagem : '');
      return { ok: resultado.ok && conf.ok, valor: senha };
    }

    function formularioRespValido() {
      const emailOk = validarEmailResp(false).ok;
      const senhaOk = validarSenhaResp(false).ok;
      if (responsavelModo !== 'cadastro') return emailOk && senhaOk;
      return validarNomeResp(false).ok && validarTelefoneResp(false).ok && emailOk && senhaOk;
    }

    function atualizarBotaoResp() {
      if (V) V.atualizarBotaoEnviar(btnContinuar, formularioRespValido());
      else if (btnContinuar) btnContinuar.disabled = !formularioRespValido();
    }

    [nomeEl, telefoneEl, emailEl, senhaEl, confirmarEl].forEach((el) => {
      if (!el || el.dataset.validacaoResp === '1') return;
      el.dataset.validacaoResp = '1';
      el.addEventListener('input', () => {
        if (el === nomeEl) validarNomeResp(true);
        if (el === emailEl) validarEmailResp(true);
        if (el === telefoneEl) validarTelefoneResp(true);
        if (el === senhaEl || el === confirmarEl) validarSenhaResp(true);
        atualizarBotaoResp();
      });
    });
    atualizarBotaoResp();

    const emailResetEl = document.getElementById('resp-email-reset');
    const erroEmailResetEl = document.getElementById('erro-resp-email-reset');
    function atualizarBotaoEnviarCodigo() {
      const ok = V ? V.validarEmail(emailResetEl && emailResetEl.value).ok : false;
      if (V) V.atualizarBotaoEnviar(btnEnviarCodigo, ok);
    }
    if (emailResetEl && emailResetEl.dataset.validacaoReset !== '1') {
      emailResetEl.dataset.validacaoReset = '1';
      emailResetEl.addEventListener('input', () => {
        const r = V ? V.validarEmail(emailResetEl.value) : { ok: false, mensagem: 'Digite um e-mail válido.' };
        if (V) V.definirErroCampo(erroEmailResetEl, r.ok ? '' : r.mensagem);
        atualizarBotaoEnviarCodigo();
      });
    }
    atualizarBotaoEnviarCodigo();

    if (btnEsqueciSenha) {
      btnEsqueciSenha.onclick = () => {
        alternarRecuperacao(true);
        setErro('');
      };
    }

    if (btnCancelarReset) {
      btnCancelarReset.onclick = () => {
        mostrarTelaResetComToken('');
        alternarRecuperacao(false);
        setErro('');
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
    }

    if (btnEnviarCodigo) {
      btnEnviarCodigo.onclick = async () => {
        const inputEmailReset = document.getElementById('resp-email-reset');
        const emailVal = V ? V.validarEmail(inputEmailReset && inputEmailReset.value) : { ok: false, valor: '' };
        const erroEmailReset = document.getElementById('erro-resp-email-reset');
        if (V) V.definirErroCampo(erroEmailReset, emailVal.ok ? '' : (V.MSG_EMAIL || 'Digite um e-mail válido.'));
        if (!emailVal.ok) return;

        try {
          setErro('Enviando link...');
          await apiRequest('/api/v1/parents/forgot-password', 'POST', { email: emailVal.valor });
          setErro('Se o e-mail estiver cadastrado, enviaremos um link');
        } catch (e) {
          console.error(e);
          setErro('Se o e-mail estiver cadastrado, enviaremos um link');
        }
      };
    }

    if (btnContinuar) {
      btnContinuar.onclick = async () => {
        const sobrenomeEl = document.getElementById('resp-sobrenome');
        const nomeVal = validarNomeResp(true);
        const sobrenome = sobrenomeEl ? sobrenomeEl.value.trim() : '';
        const senhaVal = validarSenhaResp(true);
        const emailVal = validarEmailResp(true);
        const telVal = validarTelefoneResp(true);

        if (!emailVal.ok) {
          atualizarBotaoResp();
          return;
        }
        if (!senhaVal.ok || (responsavelModo === 'cadastro' && !nomeVal.ok)) {
          atualizarBotaoResp();
          return;
        }
        if (responsavelModo === 'cadastro' && !telVal.ok) {
          atualizarBotaoResp();
          return;
        }

        try {
          let sessaoApi = null;
          if (responsavelModo === 'cadastro') {
            sessaoApi = await apiRequest('/api/v1/parents/register', 'POST', {
              nome: nomeVal.valor,
              sobrenome,
              telefone: telVal.valor,
              email: emailVal.valor,
              senha: senhaVal.valor
            });
          } else {
            sessaoApi = await apiRequest('/api/v1/parents/login', 'POST', { email: emailVal.valor, senha: senhaVal.valor });
          }

          const respId = sessaoApi ? (sessaoApi.responsavelId ?? sessaoApi.ResponsavelId ?? sessaoApi.id) : null;
          const sessao = { email: emailVal.valor, em: Date.now(), responsavelId: respId };
          setErro('');
          salvarJSON(CHAVE_SESSAO, sessao);

          await abrirSelecaoPerfis();
        } catch (e) {
          console.error('ERRO AUTENTICAÇÃO:', e);
          const msg = e.message || 'Falha ao conectar com a API.';
          if (V && msg === V.MSG_EMAIL_DUPLICADO) {
            V.definirErroCampo(erroEmailEl, V.MSG_EMAIL_DUPLICADO);
          } else if (V && msg === V.MSG_TELEFONE) {
            V.definirErroCampo(erroTelEl, V.MSG_TELEFONE);
          } else if (V && msg === V.MSG_EMAIL) {
            V.definirErroCampo(erroEmailEl, V.MSG_EMAIL);
          } else if (V && (msg === V.MSG_SENHA || msg === V.MSG_SENHA_COMUM)) {
            V.definirErroCampo(erroSenhaEl, msg);
          } else {
            setErro(msg);
          }
        }
      };
    }

    const novaSenhaEl = document.getElementById('resp-nova-senha');
    const confirmarNovaSenhaEl = document.getElementById('resp-confirmar-nova-senha');
    const erroNovaSenhaEl = document.getElementById('erro-resp-nova-senha');
    const erroConfirmarNovaEl = document.getElementById('erro-resp-confirmar-nova-senha');
    const requisitosNovaEl = document.getElementById('resp-nova-senha-requisitos');
    const tokenResetEl = document.getElementById('resp-reset-token');
    const pedidoResetEl = document.getElementById('resp-pedido-reset');
    const redefinirBoxEl = document.getElementById('resp-redefinir-box');

    function validarNovaSenhaReset(mostrarErro) {
      const senha = novaSenhaEl ? novaSenhaEl.value : '';
      const resultado = V ? V.validarSenha(senha) : { ok: senha.length >= 8, mensagem: '', valor: senha, requisitos: {} };
      if (V) {
        V.atualizarRequisitosSenha(requisitosNovaEl, resultado.requisitos || V.requisitosSenha(senha));
        V.definirErroCampo(erroNovaSenhaEl, mostrarErro && !resultado.ok ? resultado.mensagem : '');
      }
      const confirmar = confirmarNovaSenhaEl ? confirmarNovaSenhaEl.value : '';
      const conf = V ? V.validarConfirmacaoSenha(senha, confirmar) : { ok: senha === confirmar };
      if (V) V.definirErroCampo(erroConfirmarNovaEl, mostrarErro && !conf.ok ? conf.mensagem : '');
      return { ok: resultado.ok && conf.ok, valor: senha };
    }

    function tokenResetAtual() {
      return tokenResetEl ? (tokenResetEl.value || '').trim() : '';
    }

    function mostrarTelaResetComToken(token) {
      if (tokenResetEl) tokenResetEl.value = token || '';
      if (pedidoResetEl) pedidoResetEl.classList.toggle('oculto', !!token);
      if (redefinirBoxEl) redefinirBoxEl.classList.toggle('oculto', !token);
      atualizarBotaoResetarSenha();
    }

    function atualizarBotaoResetarSenha() {
      const senhaOk = validarNovaSenhaReset(false).ok;
      const tokenOk = !!tokenResetAtual();
      if (V) V.atualizarBotaoEnviar(btnResetarSenha, tokenOk && senhaOk);
    }

    [novaSenhaEl, confirmarNovaSenhaEl].forEach((el) => {
      if (!el || el.dataset.validacaoResetSenha === '1') return;
      el.dataset.validacaoResetSenha = '1';
      el.addEventListener('input', () => {
        validarNovaSenhaReset(true);
        atualizarBotaoResetarSenha();
      });
    });
    atualizarBotaoResetarSenha();

    const tokenUrl = new URLSearchParams(window.location.search).get('reset');
    if (tokenUrl) {
      alternarRecuperacao(true);
      mostrarTelaResetComToken(tokenUrl);
    } else {
      mostrarTelaResetComToken('');
    }

    if (btnResetarSenha) {
      btnResetarSenha.onclick = async () => {
        const token = tokenResetAtual();
        const senhaVal = validarNovaSenhaReset(true);
        if (!token || !senhaVal.ok) {
          if (!token) setErro('Link inválido ou expirado.');
          atualizarBotaoResetarSenha();
          return;
        }

        try {
          setErro('Redefinindo senha...');
          await apiRequest('/api/v1/parents/reset-password', 'POST', { token, novaSenha: senhaVal.valor });

          if (novaSenhaEl) novaSenhaEl.value = '';
          if (confirmarNovaSenhaEl) confirmarNovaSenhaEl.value = '';
          if (document.getElementById('resp-senha')) document.getElementById('resp-senha').value = '';
          if (V) {
            V.definirErroCampo(erroNovaSenhaEl, '');
            V.definirErroCampo(erroConfirmarNovaEl, '');
            V.atualizarRequisitosSenha(requisitosNovaEl, V.requisitosSenha(''));
          }

          mostrarTelaResetComToken('');
          responsavelModo = 'login';
          alternarRecuperacao(false);
          atualizarCamposPorModo();
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }

          setErro('Senha redefinida com sucesso. Agora faça login.');
        } catch (e) {
          console.error(e);
          const msg = e.message || 'Não foi possível redefinir a senha.';
          if (V && (msg === V.MSG_SENHA || msg === V.MSG_SENHA_COMUM)) {
            V.definirErroCampo(erroNovaSenhaEl, msg);
          } else {
            setErro(msg);
          }
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
        msgVazia.textContent = 'Ainda não tem criança cadastrada. Toque abaixo para adicionar.';
        lista.appendChild(msgVazia);
      } else {
        perfisApi.forEach((p) => {
          const btn = document.createElement('button');
          btn.className = 'avatar-btn avatar-btn-perfil';
          btn.type = 'button';
          const imgWrap = document.createElement('span');
          imgWrap.className = 'avatar-btn-perfil-img';
          if (typeof renderizarElementoAvatar === 'function') {
            renderizarElementoAvatar(imgWrap, p.avatar || p.Avatar || 'midia/user/sapo.png', 'avatar-img');
          } else {
            const img = document.createElement('img');
            img.src = (typeof normalizarCaminhoAvatar === 'function')
              ? normalizarCaminhoAvatar(p.avatar || p.Avatar || 'midia/user/sapo.png')
              : (p.avatar || p.Avatar || 'midia/user/sapo.png');
            img.alt = '';
            img.className = 'avatar-img';
            imgWrap.appendChild(img);
          }
          const nomeElPerfil = document.createElement('small');
          nomeElPerfil.className = 'avatar-btn-perfil-nome';
          nomeElPerfil.textContent = p.nome || p.Nome || '';
          btn.appendChild(imgWrap);
          btn.appendChild(nomeElPerfil);

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
      if (typeof configurarPortaoParental === 'function') {
        configurarPortaoParental({
          onSuccess: () => {
            if (typeof marcarPortaoParentalOk === 'function') marcarPortaoParentalOk();
            window.location.href = 'configuracoes.html';
          }
        });
        btnConfig.onclick = () => {
          if (typeof abrirPortaoParental === 'function') abrirPortaoParental();
        };
      } else {
        btnConfig.onclick = () => {
          window.location.href = 'configuracoes.html';
        };
      }
    }
  }

  function entrarComPerfil(perfilApi) {
    const perfilObj = {
      id: perfilApi.id || perfilApi.Id,
      nome: perfilApi.nome || perfilApi.Nome,
      avatar: typeof normalizarCaminhoAvatar === 'function'
        ? normalizarCaminhoAvatar(perfilApi.avatar || perfilApi.Avatar)
        : (perfilApi.avatar || perfilApi.Avatar || 'midia/user/sapo.png'),
      genero: perfilApi.generoFavorito || perfilApi.GeneroFavorito || 'narrativo',
      dataNascimento: perfilApi.dataNascimento || perfilApi.DataNascimento,
      faixa: perfilApi.faixaEtaria || perfilApi.FaixaEtaria || 1,
      horarioBrincar: window.FabularValidacao
        ? (window.FabularValidacao.obterHorarioBrincar(perfilApi) || null)
        : (perfilApi.horarioBrincar || perfilApi.HorarioBrincar || null)
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

  const tokenResetUrl = new URLSearchParams(window.location.search).get('reset');

  const btnVoltarPerfis = document.getElementById('btn-voltar-perfis');
  if (btnVoltarPerfis) {
    btnVoltarPerfis.addEventListener('click', () => {
      const sessao = getSessaoResponsavel();
      if (sessao && sessao.email && sessao.responsavelId) abrirSelecaoPerfis();
      else mostrarCard('#responsavel-card');
    });
  }

  const sessaoInicial = getSessaoResponsavel();
  if (tokenResetUrl) {
    mostrarCard('#responsavel-card');
  } else if (sessaoInicial && sessaoInicial.email && sessaoInicial.responsavelId) {
    abrirSelecaoPerfis();
  } else {
    mostrarCard('#responsavel-card');
  }

  window.addEventListener('pageshow', (evento) => {
    if (!evento.persisted) return;
    const sessao = getSessaoResponsavel();
    if (sessao && sessao.email && sessao.responsavelId) {
      abrirSelecaoPerfis();
    }
  });

})();