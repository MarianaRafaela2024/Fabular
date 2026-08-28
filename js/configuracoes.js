/* =============================================
   configuracoes.js — Página de Configurações do Responsável
   ============================================= */
'use strict';

(function () {
  const CHAVE_ESTADO = 'mundoHistorias_estado';
  const CHAVE_SESSAO = 'mundoHistorias_responsavel_sessao';
  const API_BASE = (window.API_BASE_URL || 'http://localhost:5275').replace(/\/$/, '');

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

  function getSessaoResponsavel() {
    return carregarJSON(CHAVE_SESSAO, null);
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
      console.warn("Falha ao carregar crianças da API:", e.message);
      return [];
    }
  }

  let criancasConfig = [];
  let criancaConfigEdit = { genero: 'narrativo', avatar: 'midia/lion.png' };

  function setConfigMsg(erro, sucesso) {
    const erroEl = document.getElementById('config-erro');
    const okEl = document.getElementById('config-sucesso');
    if (erroEl) {
      if (erro) {
        erroEl.textContent = erro;
        erroEl.classList.remove('oculto');
      } else {
        erroEl.textContent = '';
        erroEl.classList.add('oculto');
      }
    }
    if (okEl) {
      if (sucesso) {
        okEl.textContent = sucesso;
        okEl.classList.remove('oculto');
      } else {
        okEl.textContent = '';
        okEl.classList.add('oculto');
      }
    }
  }

  function formatarDataInput(valor) {
    if (!valor) return '';
    if (typeof valor === 'string' && valor.length >= 10) return valor.slice(0, 10);
    try {
      return new Date(valor).toISOString().slice(0, 10);
    } catch (_) {
      return '';
    }
  }

  function preencherSelectCriancas(selectEl, criancas, placeholder) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    if (!criancas || criancas.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = placeholder || 'Nenhuma criança cadastrada';
      selectEl.appendChild(opt);
      return;
    }
    criancas.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = String(c.id || c.Id);
      opt.textContent = c.nome || c.Nome;
      selectEl.appendChild(opt);
    });
  }

  async function carregarPerfilResponsavel(responsavelId) {
    const data = await apiRequest(`/api/v1/parents/${encodeURIComponent(responsavelId)}`, 'GET');
    const nomeEl = document.getElementById('config-resp-nome');
    const sobrenomeEl = document.getElementById('config-resp-sobrenome');
    const telefoneEl = document.getElementById('config-resp-telefone');
    const emailEl = document.getElementById('config-resp-email');
    if (nomeEl) nomeEl.value = data.nome || data.Nome || '';
    if (sobrenomeEl) sobrenomeEl.value = data.sobrenome || data.Sobrenome || '';
    if (telefoneEl) telefoneEl.value = data.telefone || data.Telefone || '';
    if (emailEl) emailEl.value = data.email || data.Email || '';
  }

  function selecionarGeneroConfig(genero) {
    criancaConfigEdit.genero = genero;
    document.querySelectorAll('#config-genero-grupo .chip').forEach(btn => {
      const ativo = btn.dataset.genero === genero;
      btn.classList.toggle('ativo', ativo);
      btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
  }

  function selecionarAvatarConfig(avatar) {
    criancaConfigEdit.avatar = avatar;
    document.querySelectorAll('#config-avatar-grid .avatar-btn').forEach(btn => {
      const ativo = btn.dataset.av === avatar;
      btn.classList.toggle('ativo', ativo);
      btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
  }

  function preencherFormCriancaConfig(crianca) {
    const nomeEl = document.getElementById('config-crianca-nome');
    const nascEl = document.getElementById('config-crianca-nascimento');
    const horarioEl = document.getElementById('config-crianca-horario');
    if (nomeEl) nomeEl.value = crianca.nome || crianca.Nome || '';
    if (nascEl) nascEl.value = formatarDataInput(crianca.dataNascimento || crianca.DataNascimento);
    if (horarioEl) horarioEl.value = crianca.horarioBrincar || crianca.HorarioBrincar || '';
    selecionarGeneroConfig(crianca.generoFavorito || crianca.GeneroFavorito || 'narrativo');
    selecionarAvatarConfig(crianca.avatar || crianca.Avatar || 'midia/lion.png');
  }

  function obterCriancaSelecionada(selectId) {
    const select = document.getElementById(selectId);
    if (!select || !select.value) return null;
    const id = Number(select.value);
    return criancasConfig.find(c => Number(c.id || c.Id) === id) || null;
  }

  async function carregarRelatorioCrianca(responsavelId, crianca) {
    const cont = document.getElementById('config-relatorios-conteudo');
    if (!cont || !crianca) {
      if (cont) cont.innerHTML = '<p class="tela-sub">Selecione uma criança para ver o relatório.</p>';
      return;
    }

    const criancaId = crianca.id || crianca.Id;
    const nome = crianca.nome || crianca.Nome;
    cont.innerHTML = '<p class="tela-sub">Carregando relatório...</p>';

    let prog = null;
    try {
      prog = await apiRequest(
        `/api/v1/sync/progress?responsavelId=${encodeURIComponent(responsavelId)}&criancaId=${encodeURIComponent(criancaId)}`,
        'GET'
      );
    } catch (_) { }

    let localDados = null;
    try {
      const rawC = localStorage.getItem(`mundoHistorias_estado_crianca_${criancaId}`);
      if (rawC) localDados = JSON.parse(rawC);
    } catch (_) { }

    const hlLocal = localDados?.historiasLidas || [];
    const hlRemoto = Array.isArray(prog?.historiasLidas) ? prog.historiasLidas : (prog?.HistoriasLidas || []);

    const historias = Math.max(hlLocal.length, hlRemoto.length);
    const estrelas = Math.max(prog?.totalEstrelas ?? prog?.TotalEstrelas ?? 0, localDados?.totalEstrelas || 0);
    const tempo = Math.max(prog?.tempoTotal ?? prog?.TempoTotal ?? 0, localDados?.tempoTotal || 0);
    const minigames = Math.max(prog?.minigamesJogados ?? prog?.MinigamesJogados ?? 0, localDados?.minigamesJogados || 0);
    const reprovadas = Math.max(prog?.tentativasReprovadas ?? prog?.TentativasReprovadas ?? 0, localDados?.tentativasReprovadas || 0);
    const acertos = Math.max(prog?.acertosMG ?? prog?.AcertosMG ?? 0, localDados?.acertosMG || 0);
    const erros = Math.max(prog?.errosMG ?? prog?.ErrosMG ?? 0, localDados?.errosMG || 0);

    cont.innerHTML = `
      <div class="config-relatorio-card">
        <h4>📄 Relatório — ${nome}</h4>
        <div class="config-stats-grid">
          <div class="config-stat"><strong>${historias}</strong>Histórias concluídas</div>
          <div class="config-stat"><strong>${estrelas}</strong>Estrelas</div>
          <div class="config-stat"><strong>${tempo} min</strong>Tempo total</div>
          <div class="config-stat"><strong>${minigames}</strong>Minigames</div>
          <div class="config-stat"><strong>${reprovadas}</strong>Tentativas reprovadas</div>
          <div class="config-stat"><strong>${acertos}</strong>Acertos MG</div>
          <div class="config-stat"><strong>${erros}</strong>Erros MG</div>
        </div>
      </div>
    `;
  }

  function configurarAbasConfig() {
    document.querySelectorAll('.config-aba').forEach(btn => {
      btn.onclick = () => {
        const secao = btn.dataset.secao;
        document.querySelectorAll('.config-aba').forEach(b => {
          const ativo = b.dataset.secao === secao;
          b.classList.toggle('ativo', ativo);
          b.setAttribute('aria-selected', ativo ? 'true' : 'false');
        });
        ['relatorios', 'responsavel', 'crianca'].forEach(nome => {
          const el = document.getElementById(`config-secao-${nome}`);
          if (!el) return;
          if (nome === secao) {
            el.classList.remove('oculto');
            el.classList.add('ativa');
          } else {
            el.classList.add('oculto');
            el.classList.remove('ativa');
          }
        });
        setConfigMsg('', '');
      };
    });
  }

  function configurarEventosConfig() {
    document.querySelectorAll('#config-genero-grupo .chip').forEach(btn => {
      btn.onclick = () => selecionarGeneroConfig(btn.dataset.genero);
    });
    document.querySelectorAll('#config-avatar-grid .avatar-btn').forEach(btn => {
      btn.onclick = () => selecionarAvatarConfig(btn.dataset.av);
    });

    const selectRelatorio = document.getElementById('config-relatorio-crianca');
    if (selectRelatorio) {
      selectRelatorio.onchange = async () => {
        const sessao = getSessaoResponsavel();
        const crianca = obterCriancaSelecionada('config-relatorio-crianca');
        if (sessao?.responsavelId) await carregarRelatorioCrianca(sessao.responsavelId, crianca);
      };
    }

    const selectCrianca = document.getElementById('config-crianca-select');
    if (selectCrianca) {
      selectCrianca.onchange = () => {
        const crianca = obterCriancaSelecionada('config-crianca-select');
        if (crianca) preencherFormCriancaConfig(crianca);
      };
    }

    const btnSalvarResp = document.getElementById('btn-salvar-responsavel');
    if (btnSalvarResp) {
      btnSalvarResp.onclick = async () => {
        const sessao = getSessaoResponsavel();
        if (!sessao?.responsavelId) return;
        setConfigMsg('', '');

        const nome = document.getElementById('config-resp-nome')?.value.trim();
        const sobrenome = document.getElementById('config-resp-sobrenome')?.value.trim();
        const telefone = document.getElementById('config-resp-telefone')?.value.trim();
        const email = document.getElementById('config-resp-email')?.value.trim().toLowerCase();
        const senhaAtual = document.getElementById('config-resp-senha-atual')?.value.trim();
        const novaSenha = document.getElementById('config-resp-nova-senha')?.value.trim();

        if (!nome || !email) {
          setConfigMsg('Nome e e-mail são obrigatórios.', '');
          return;
        }

        try {
          const atualizado = await apiRequest(
            `/api/v1/parents/${encodeURIComponent(sessao.responsavelId)}`,
            'PUT',
            { nome, sobrenome, telefone, email, senhaAtual: senhaAtual || null, novaSenha: novaSenha || null }
          );
          const novoEmail = atualizado.email || atualizado.Email || email;
          salvarJSON(CHAVE_SESSAO, { ...sessao, email: novoEmail });
          document.getElementById('config-resp-senha-atual').value = '';
          document.getElementById('config-resp-nova-senha').value = '';
          setConfigMsg('', 'Dados do responsável atualizados com sucesso!');
        } catch (e) {
          setConfigMsg(e.message || 'Falha ao salvar dados do responsável.', '');
        }
      };
    }

    const btnSalvarCrianca = document.getElementById('btn-salvar-crianca');
    if (btnSalvarCrianca) {
      btnSalvarCrianca.onclick = async () => {
        const sessao = getSessaoResponsavel();
        const crianca = obterCriancaSelecionada('config-crianca-select');
        if (!sessao?.responsavelId || !crianca) {
          setConfigMsg('Selecione uma criança para atualizar.', '');
          return;
        }
        setConfigMsg('', '');

        const nome = document.getElementById('config-crianca-nome')?.value.trim();
        const dataNascimento = document.getElementById('config-crianca-nascimento')?.value;
        const horarioBrincar = document.getElementById('config-crianca-horario')?.value || null;

        if (!nome || !dataNascimento) {
          setConfigMsg('Nome e data de nascimento são obrigatórios.', '');
          return;
        }

        const criancaId = crianca.id || crianca.Id;
        try {
          const atualizado = await apiRequest(
            `/api/v1/children/${encodeURIComponent(criancaId)}`,
            'PUT',
            {
              responsavelId: Number(sessao.responsavelId),
              nome,
              dataNascimento,
              avatar: criancaConfigEdit.avatar,
              generoFavorito: criancaConfigEdit.genero,
              horarioBrincar
            }
          );
          const idx = criancasConfig.findIndex(c => Number(c.id || c.Id) === Number(criancaId));
          if (idx >= 0) criancasConfig[idx] = atualizado;
          preencherSelectCriancas(document.getElementById('config-relatorio-crianca'), criancasConfig);
          preencherSelectCriancas(document.getElementById('config-crianca-select'), criancasConfig);
          const selectRel = document.getElementById('config-relatorio-crianca');
          const selectCri = document.getElementById('config-crianca-select');
          if (selectRel) selectRel.value = String(criancaId);
          if (selectCri) selectCri.value = String(criancaId);
          preencherFormCriancaConfig(atualizado);
          await carregarRelatorioCrianca(sessao.responsavelId, atualizado);
          setConfigMsg('', 'Dados da criança atualizados com sucesso!');
        } catch (e) {
          setConfigMsg(e.message || 'Falha ao salvar dados da criança.', '');
        }
      };
    }

    const btnVoltar = document.getElementById('btn-voltar-perfis-config');
    if (btnVoltar) {
      btnVoltar.onclick = () => {
        window.location.href = 'login.html';
      };
    }
  }

  async function abrirConfiguracoes() {
    const sessao = getSessaoResponsavel();
    if (!sessao?.responsavelId) {
      window.location.href = 'login.html';
      return;
    }

    setConfigMsg('', '');

    try {
      criancasConfig = await carregarCriancas(sessao.responsavelId);
      preencherSelectCriancas(document.getElementById('config-relatorio-crianca'), criancasConfig, 'Nenhuma criança cadastrada');
      preencherSelectCriancas(document.getElementById('config-crianca-select'), criancasConfig, 'Nenhuma criança cadastrada');

      if (criancasConfig.length > 0) {
        preencherFormCriancaConfig(criancasConfig[0]);
        await carregarRelatorioCrianca(sessao.responsavelId, criancasConfig[0]);
      } else {
        document.getElementById('config-relatorios-conteudo').innerHTML =
          '<p class="tela-sub">Cadastre uma criança para visualizar relatórios.</p>';
      }

      await carregarPerfilResponsavel(sessao.responsavelId);
    } catch (e) {
      setConfigMsg(e.message || 'Falha ao carregar configurações.', '');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    configurarAbasConfig();
    configurarEventosConfig();
    abrirConfiguracoes();
  });
})();
