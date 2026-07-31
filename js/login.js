/* =============================================
   login.js — Login da criança + responsável/perfis
   ============================================= */
'use strict';

(function () {

  /* ─────────────────────────────────────────
     PARTE 1 — PERFIL DA CRIANÇA
   ───────────────────────────────────────── */

  const perfil = { nome: '', avatar: '🦁', faixa: 1, genero: 'narrativo', dataNascimento: null };
  const CHAVE_ESTADO = 'mundoHistorias_estado';
  //const CHAVE_CONTAS = 'mundoHistorias_contas';
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
async function carregarCriancas(responsavelId) {
    return await apiRequest(
        `/api/v1/children?responsavelId=${responsavelId}`,
        "GET"
    );
}
  function criarLocalChildKey(perf) {
    const base = `${String(perf.nome || '').trim().toLowerCase()}-${String(perf.avatar || '')}-${Date.now()}`;
    return base.replace(/\s+/g, '-');
  }

  function registrarCriancaPendente(perf) {
    const perfilNormalizado = normalizarPerfilCrianca(perf);
    const pendentes = carregarJSON(CHAVE_CRIANCAS_PENDENTES, []);
    const novo = {
      localChildKey: criarLocalChildKey(perfilNormalizado),
      nome: perfilNormalizado.nome,
      faixaEtaria: perfilNormalizado.faixa,
      dataNascimento: perfilNormalizado.dataNascimento,
      avatar: perfilNormalizado.avatar,
      generoFavorito: perfilNormalizado.genero,
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
        dataNascimento: c.dataNascimento || null,
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

  function atualizarPreviewFaixa() {
    const preview = document.getElementById('faixa-preview');
    const data = document.getElementById('input-nascimento').value;
    if (!preview) return;
    if (!data) {
      preview.textContent = '';
      return;
    }
    const faixa = calcularFaixaEtaria(data);
    preview.textContent = `Faixa etária: ${labelFaixaEtaria(faixa)}`;
  }

  document.getElementById('input-nascimento').addEventListener('change', atualizarPreviewFaixa);
  document.getElementById('input-nascimento').addEventListener('input', atualizarPreviewFaixa);
  document.getElementById('input-nascimento').max = new Date().toISOString().slice(0, 10);

  function tentarEntrar() {
    const nome   = document.getElementById('input-nome').value.trim();
    const dataNascimento = document.getElementById('input-nascimento').value;
    const erroEl = document.getElementById('erro-nome');
    const erroNascimento = document.getElementById('erro-nascimento');

    if (!nome) {
      erroEl.classList.remove('oculto');
      document.getElementById('input-nome').focus();
      return;
    }
    erroEl.classList.add('oculto');

    if (!dataNascimento) {
      erroNascimento.classList.remove('oculto');
      document.getElementById('input-nascimento').focus();
      return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const nasc = new Date(dataNascimento + 'T12:00:00');
    if (nasc > hoje) {
      erroNascimento.textContent = 'A data de nascimento não pode ser no futuro.';
      erroNascimento.classList.remove('oculto');
      document.getElementById('input-nascimento').focus();
      return;
    }
    erroNascimento.classList.add('oculto');
    erroNascimento.textContent = 'Informe a data de nascimento.';

    perfil.nome = nome;
    perfil.dataNascimento = dataNascimento;
    perfil.faixa = calcularFaixaEtaria(dataNascimento);

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

  // function getContas() {
  //   return carregarJSON(CHAVE_CONTAS, { responsaveis: [] });
  // }

  // function salvarContas(contas) {
  //   salvarJSON(CHAVE_CONTAS, contas);
  // }

  async function finalizarCadastroCrianca() {
    const sessao = getSessaoResponsavel();
    if (!sessao || !sessao.email) {
      configurarCardResponsavel();
      mostrarCard('#responsavel-card');
      return;
    }
   

if (!sessao) {
    mostrarCard('#responsavel-card');
    return;
}

const perfis = await carregarCriancas(sessao.responsavelId);
    // const contas = getContas();
    // const resp = contas.responsaveis.find(r => r.email === sessao.email);
    // if (!resp) {
    //   localStorage.removeItem(CHAVE_SESSAO);
    //   configurarCardResponsavel();
    //   mostrarCard('#responsavel-card');
    //   return;
    // }

    // const nomeNovo = perfil.nome.trim().toLowerCase();
    // const avatarNovo = perfil.avatar;
    // const duplicado = (resp.perfis || []).some((p) =>
    //   String(p.nome || '').trim().toLowerCase() === nomeNovo &&
    //   String(p.avatar || '') === avatarNovo
    // );
    // if (!duplicado) {
    //   const novo = Object.assign({}, perfil);
    //   resp.perfis = resp.perfis || [];
    //   resp.perfis.push(novo);
    //   salvarContas(contas);
    // }
      const nomeNovo = perfil.nome.trim().toLowerCase();
      const avatarNovo = perfil.avatar;

      const duplicado = (perfis || []).some((p) =>
        String(p.nome || '').trim().toLowerCase() === nomeNovo &&
        String(p.avatar || '') === avatarNovo
      );

      if (!duplicado) {
        console.log('Nova criança será sincronizada:', perfil);
      }
    try {
      await sincronizarCriancasPendentes(sessao);
    } catch (_) {}

    const estado = carregarJSON(CHAVE_ESTADO, {});
    estado.perfil = normalizarPerfilCrianca(Object.assign({}, perfil));
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
      const email = document
        .getElementById('resp-email-reset')
        .value
        .trim()
        .toLowerCase();
    
      if (!email) {
        setErro('Digite seu e-mail.');
        return;
      }
    
      try {
        setErro('Enviando código...');
        const resposta = await fetch(
          'https://localhost:7157/api/v1/parents/forgot-password',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email
            })
          }
        );
    
        const dados = await resposta.json();
        if (!resposta.ok) {
          throw new Error(
            dados.message ||
            'Não foi possível enviar o código.'
          );
        }
    
        setErro(
          'Código enviado com sucesso. Verifique sua caixa de entrada.'
        );
      } catch (e) {
        console.error(e);
        setErro(
          e.message ||
          'Não foi possível enviar o código.'
        );
      }
    };

    document.getElementById('btn-resp-continuar').onclick = async () => {
      const nome = document.getElementById('resp-nome').value.trim();
      const sobrenome = document.getElementById('resp-sobrenome').value.trim();
      const email = document.getElementById('resp-email').value.trim().toLowerCase();
      const senha = document.getElementById('resp-senha').value.trim();
      //const contas = getContas();
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
      //    const existente = contas.responsaveis.find(r => r.email === email);
      try {
        let sessaoApi = null;
        if (responsavelModo === 'cadastro') {
          // if (existente) {
          //   setErro('E-mail já cadastrado.');
          //   return;
          // }
          //contas.responsaveis.push({ nome, sobrenome, email, senha, perfis: [] });
          //salvarContas(contas);
          sessaoApi = await apiRequest('/api/v1/parents/register', 'POST', { nome, sobrenome, email, senha });
        } else {
          // if (!existente || existente.senha !== senha) {
          //   setErro('E-mail ou senha inválidos.');
          //   return;
          // }
          sessaoApi = await apiRequest('/api/v1/parents/login', 'POST', { email, senha });
        }

        const sessao = { email, em: Date.now(), responsavelId: sessaoApi.responsavelId };
        setErro('');
        salvarJSON(CHAVE_SESSAO, sessao);
        await sincronizarCriancasPendentes(sessao);
        await abrirSelecaoPerfis();
      } catch (e) {
        console.error('ERRO CADASTRO:', e);
        setErro(e.message || 'Falha ao conectar com a API.');
      }
    };

    btnResetarSenha.onclick = async () => {
      const email = document
        .getElementById('resp-email-reset')
        .value
        .trim()
        .toLowerCase();
    
      const codigo = document
        .getElementById('resp-codigo-reset')
        .value
        .trim();
    
      const novaSenha = document
        .getElementById('resp-nova-senha')
        .value
        .trim();
    
      if (!email || !codigo || !novaSenha) {
        setErro(
          'Preencha e-mail, código e nova senha.'
        );
        return;
      }
    
      try {
        setErro('Redefinindo senha...');
        const resposta = await fetch(
          'https://localhost:7157/api/v1/parents/reset-password',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email,
              codigo,
              novaSenha
            })
          }
        );
    
        const dados = await resposta.json();
        if (!resposta.ok) {
          throw new Error(
            dados.message ||
            'Não foi possível redefinir a senha.'
          );
        }
    
        document.getElementById('resp-email').value = email;
        document.getElementById('resp-email-reset').value = '';
        document.getElementById('resp-codigo-reset').value = '';
        document.getElementById('resp-nova-senha').value = '';
        document.getElementById('resp-senha').value = '';
    
        responsavelModo = 'login';
        alternarRecuperacao(false);
    
        if (typeof atualizarCamposPorModo === 'function') {
          atualizarCamposPorModo();
        }
    
        setErro(
          'Senha redefinida com sucesso. Agora faça login.'
        );
      } catch (e) {
        console.error(e);
        setErro(
          e.message ||
          'Não foi possível redefinir a senha.'
        );
      }
    };
  }
async function abrirSelecaoPerfis() {
  const sessao = getSessaoResponsavel();

  if (!sessao) {
    mostrarCard('#responsavel-card');
    return;
  }

  const perfis = await carregarCriancas(sessao.responsavelId);

  mostrarCard('#perfis-card');

  const lista = document.getElementById('perfis-lista');
  lista.innerHTML = '';

  (perfis || []).forEach((p) => {
    const btn = document.createElement('button');
    btn.className = 'avatar-btn';
    btn.innerHTML = `
      <img src="${p.avatar}" alt="Avatar" class="avatar-img">
      <small style="display:block;font-size:.7rem">${p.nome}</small>
    `;

    btn.addEventListener('click', () => entrarComPerfil(p));

    lista.appendChild(btn);
  });

  document.getElementById('btn-add-crianca').onclick = () => {
    document.getElementById('input-nome').value = '';
    document.getElementById('input-nascimento').value = '';
    document.getElementById('faixa-preview').textContent = '';
    document.getElementById('erro-nome').classList.add('oculto');
    document.getElementById('erro-nascimento').classList.add('oculto');
    mostrarCard('#crianca-card');
  };

  document.getElementById('btn-logout-resp').onclick = () => {
    localStorage.removeItem(CHAVE_SESSAO);
    mostrarCard('#responsavel-card');
  };
}

  // function entrarComPerfil(resp, perfilIdx) {
  //   const p = (resp.perfis || [])[perfilIdx];
  //   if (!p) return;
  //   const estado = carregarJSON(CHAVE_ESTADO, {});
  //   estado.perfil = p;
  //   salvarJSON(CHAVE_ESTADO, estado);
  //   window.location.href = 'index.html';
  // }
    function entrarComPerfil(perfilApi) {
        const estado = carregarJSON(CHAVE_ESTADO, {});
        estado.perfil = normalizarPerfilCrianca({
            id: perfilApi.id,
            nome: perfilApi.nome,
            avatar: perfilApi.avatar,
            genero: perfilApi.generoFavorito,
            dataNascimento: perfilApi.dataNascimento,
            faixa: perfilApi.faixaEtaria,
            localChildKey: perfilApi.localChildKey
        });
        salvarJSON(CHAVE_ESTADO, estado);

        window.location.href = "index.html";
    }

  /* ─────────────────────────────────────────
     PARTE 3 — INICIALIZAÇÃO
     Responsável primeiro; perfis se já logado
  ───────────────────────────────────────── */
  configurarCardResponsavel();

  document.getElementById('btn-voltar-perfis').addEventListener('click', () => {
    const sessao = getSessaoResponsavel();
    if (sessao && sessao.email) abrirSelecaoPerfis();
    else mostrarCard('#responsavel-card');
  });

  const sessaoInicial = getSessaoResponsavel();
  if (sessaoInicial && sessaoInicial.email) {
    abrirSelecaoPerfis(sessaoInicial.email);
  } else {
    mostrarCard('#responsavel-card');
  }

})();
