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
    const texto = await resp.text();
    let data = null;
    if (texto) {
      try { data = JSON.parse(texto); } catch (_) { data = null; }
    }
    if (!resp.ok) {
      throw new Error((data && data.message) || `Erro ${resp.status}`);
    }
    return data;
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
  let criancaConfigEdit = { genero: 'narrativo', avatar: 'midia/user/sapo.png' };

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

  function avatarCrianca(crianca) {
    const bruto = crianca ? (crianca.avatar || crianca.Avatar || 'midia/user/sapo.png') : 'midia/user/sapo.png';
    return typeof normalizarCaminhoAvatar === 'function' ? normalizarCaminhoAvatar(bruto) : bruto;
  }

  function renderizarPreviaAvatar(el, avatar) {
    if (!el) return;
    if (typeof renderizarElementoAvatar === 'function') {
      renderizarElementoAvatar(el, avatar, 'config-avatar-previa-img');
    } else {
      el.innerHTML = `<img src="${avatar}" alt="" class="config-avatar-previa-img">`;
    }
  }

  function atualizarPreviasAvatar(crianca) {
    const av = avatarCrianca(crianca);
    renderizarPreviaAvatar(document.getElementById('config-crianca-avatar-previa'), av);
    renderizarPreviaAvatar(document.getElementById('config-relatorio-avatar-previa'), av);
  }

  function sincronizarAvatarLocal(criancaId, avatar, extras) {
    const av = typeof normalizarCaminhoAvatar === 'function' ? normalizarCaminhoAvatar(avatar) : avatar;
    const idx = criancasConfig.findIndex(c => Number(c.id || c.Id) === Number(criancaId));
    if (idx >= 0) {
      criancasConfig[idx] = Object.assign({}, criancasConfig[idx], extras || {}, { avatar: av, Avatar: av });
    }

    try {
      const estado = carregarJSON(CHAVE_ESTADO, {});
      const pid = estado?.perfil?.id || estado?.perfil?.Id;
      if (estado?.perfil && Number(pid) === Number(criancaId)) {
        estado.perfil.avatar = av;
        if (extras?.nome || extras?.Nome) estado.perfil.nome = extras.nome || extras.Nome;
        salvarJSON(CHAVE_ESTADO, estado);
      }
    } catch (_) { }

    try {
      const chave = `mundoHistorias_estado_crianca_${criancaId}`;
      const raw = localStorage.getItem(chave);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.perfil) {
          parsed.perfil.avatar = av;
          localStorage.setItem(chave, JSON.stringify(parsed));
        }
      }
    } catch (_) { }
  }

  async function persistirAvatarImediatamente(avatar) {
    const sessao = getSessaoResponsavel();
    const crianca = obterCriancaSelecionada('config-crianca-select');
    if (!sessao?.responsavelId || !crianca) return;

    const av = typeof normalizarCaminhoAvatar === 'function' ? normalizarCaminhoAvatar(avatar) : avatar;
    const criancaId = crianca.id || crianca.Id;
    sincronizarAvatarLocal(criancaId, av);
    atualizarPreviasAvatar(Object.assign({}, crianca, { avatar: av, Avatar: av }));

    const nome = document.getElementById('config-crianca-nome')?.value.trim()
      || crianca.nome || crianca.Nome;
    const dataNascimento = document.getElementById('config-crianca-nascimento')?.value
      || formatarDataInput(crianca.dataNascimento || crianca.DataNascimento);
    const horarioBrincar = document.getElementById('config-crianca-horario')?.value
      || crianca.horarioBrincar || crianca.HorarioBrincar || null;

    if (!nome || !dataNascimento) return;

    try {
      const atualizado = await apiRequest(
        `/api/v1/children/${encodeURIComponent(criancaId)}`,
        'PUT',
        {
          responsavelId: Number(sessao.responsavelId),
          nome,
          dataNascimento,
          avatar: av,
          generoFavorito: criancaConfigEdit.genero,
          horarioBrincar
        }
      );
      const idx = criancasConfig.findIndex(c => Number(c.id || c.Id) === Number(criancaId));
      if (idx >= 0) criancasConfig[idx] = atualizado;
      sincronizarAvatarLocal(criancaId, atualizado.avatar || atualizado.Avatar || av, atualizado);
    } catch (e) {
      setConfigMsg(e.message || 'Não foi possível salvar o avatar.', '');
    }
  }

  function selecionarAvatarConfig(avatar) {
    const av = typeof normalizarCaminhoAvatar === 'function'
      ? normalizarCaminhoAvatar(avatar)
      : (avatar || 'midia/user/sapo.png');
    criancaConfigEdit.avatar = av;
    document.querySelectorAll('#config-avatar-grid .avatar-btn').forEach(btn => {
      const ativo = btn.dataset.av === av;
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
    selecionarAvatarConfig(crianca.avatar || crianca.Avatar || 'midia/user/sapo.png');
    atualizarPreviasAvatar(crianca);
  }

  function obterCriancaSelecionada(selectId) {
    const select = document.getElementById(selectId);
    if (!select || !select.value) return null;
    const id = Number(select.value);
    return criancasConfig.find(c => Number(c.id || c.Id) === id) || null;
  }

  function escapeHtmlRelatorio(valor) {
    return String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatarTempoLeitura(minutos) {
    const n = Math.max(0, Number(minutos) || 0);
    if (n < 60) return `${n} min`;
    const h = Math.floor(n / 60);
    const m = n % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  }

  function formatarDataRelatorio(valor) {
    if (!valor) return '—';
    const iso = String(valor).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, d] = iso.split('-');
      return `${d}/${m}/${y}`;
    }
    const parsed = new Date(valor);
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString('pt-BR');
    return String(valor);
  }

  function labelGeneroRelatorio(genero) {
    const mapa = {
      narrativo: 'Narrativo',
      poetico: 'Poético',
      instrucional: 'Instrucional',
      descritivo: 'Descritivo',
      informativo: 'Informativo'
    };
    const chave = String(genero || '').toLowerCase();
    return mapa[chave] || genero || '—';
  }

  function mesclarHistoriasRelatorio(local, remoto) {
    const mapa = new Map();
    [...(remoto || []), ...(local || [])].forEach((r) => {
      if (!r) return;
      const id = String(r.id || r.Id || '');
      const titulo = r.titulo || r.Titulo || '';
      const chave = id || titulo;
      if (!chave) return;
      const atual = mapa.get(chave) || {};
      mapa.set(chave, {
        titulo: titulo || atual.titulo || 'História sem título',
        genero: r.genero || r.Genero || atual.genero || '',
        data: r.dataIso || r.DataIso || r.data || r.Data || atual.data || '',
        estrelas: Math.max(Number(r.estrelas || r.Estrelas) || 0, Number(atual.estrelas) || 0)
      });
    });
    return Array.from(mapa.values()).sort((a, b) => String(b.data).localeCompare(String(a.data)));
  }

  async function carregarRelatorioCrianca(responsavelId, crianca) {
    const cont = document.getElementById('config-relatorios-conteudo');
    if (!cont || !crianca) {
      if (cont) cont.innerHTML = '<p class="relatorio-estado">Selecione um perfil para visualizar o relatório.</p>';
      return;
    }

    const criancaId = crianca.id || crianca.Id;
    const nome = crianca.nome || crianca.Nome || 'Perfil';
    cont.innerHTML = '<p class="relatorio-estado">Carregando relatório de acompanhamento...</p>';

    let prog = null;
    try {
      prog = await apiRequest(
        `/api/v1/sync/progress?responsavelId=${encodeURIComponent(responsavelId)}&criancaId=${encodeURIComponent(criancaId)}`,
        'GET'
      );
    } catch (_) { }

    let localDados = null;
    try {
      const rawDedicado = localStorage.getItem(`mundoHistorias_progresso_${criancaId}`);
      if (rawDedicado) {
        localDados = JSON.parse(rawDedicado);
      } else {
        const rawC = localStorage.getItem(`mundoHistorias_estado_crianca_${criancaId}`);
        if (rawC) localDados = JSON.parse(rawC);
      }
    } catch (_) { }

    const hlLocal = localDados?.historiasLidas || [];
    const hlRemoto = Array.isArray(prog?.historiasLidas) ? prog.historiasLidas : (prog?.HistoriasLidas || []);
    const listaHistorias = mesclarHistoriasRelatorio(hlLocal, hlRemoto);

    const historias = Math.max(listaHistorias.length, hlLocal.length, hlRemoto.length);
    const estrelas = Math.max(prog?.totalEstrelas ?? prog?.TotalEstrelas ?? 0, localDados?.totalEstrelas || 0);
    const tempo = Math.max(prog?.tempoTotal ?? prog?.TempoTotal ?? 0, localDados?.tempoTotal || 0);
    const minigames = Math.max(prog?.minigamesJogados ?? prog?.MinigamesJogados ?? 0, localDados?.minigamesJogados || 0);
    const reprovadas = Math.max(prog?.tentativasReprovadas ?? prog?.TentativasReprovadas ?? 0, localDados?.tentativasReprovadas || 0);

    const maxHistoriasBonus = Math.max(5, historias * 5);
    const limiteMinigames = minigames > 0 ? Math.max(minigames, maxHistoriasBonus) : maxHistoriasBonus;

    let acertos = Math.max(prog?.acertosMG ?? prog?.AcertosMG ?? 0, localDados?.acertosMG || 0);
    let erros = Math.max(prog?.errosMG ?? prog?.ErrosMG ?? 0, localDados?.errosMG || 0);

    if (acertos > limiteMinigames) acertos = limiteMinigames;
    if (erros > limiteMinigames) erros = limiteMinigames;

    const totalRespostas = acertos + erros;
    const taxaAcerto = totalRespostas > 0 ? Math.round((acertos / totalRespostas) * 100) : null;
    const mediaMinPorHistoria = historias > 0 ? Math.round(tempo / historias) : null;
    const emitidoEm = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    const avatarHtml = typeof renderizarAvatarHTML === 'function'
      ? renderizarAvatarHTML(avatarCrianca(crianca), 'config-relatorio-avatar-img')
      : '';

    const linhasHistorias = listaHistorias.length
      ? listaHistorias.map((h) => `
          <tr>
            <td>${escapeHtmlRelatorio(h.titulo)}</td>
            <td>${escapeHtmlRelatorio(labelGeneroRelatorio(h.genero))}</td>
            <td>${escapeHtmlRelatorio(formatarDataRelatorio(h.data))}</td>
            <td>${h.estrelas}/5</td>
          </tr>`).join('')
      : '<tr><td colspan="4" class="relatorio-tabela-vazio">Nenhuma história concluída até o momento.</td></tr>';

    cont.innerHTML = `
      <article class="relatorio-painel">
        <header class="relatorio-cabecalho">
          <div class="relatorio-identidade">
            <span class="config-relatorio-titulo-avatar">${avatarHtml}</span>
            <div>
              <p class="relatorio-kicker">Relatório de acompanhamento</p>
              <h4 class="relatorio-nome">${escapeHtmlRelatorio(nome)}</h4>
              <p class="relatorio-meta">Emitido em ${escapeHtmlRelatorio(emitidoEm)}</p>
            </div>
          </div>
          <p class="relatorio-resumo">Síntese da leitura e das atividades realizadas neste perfil. Os indicadores abaixo reúnem o histórico sincronizado e o progresso registrado neste aparelho.</p>
        </header>

        <section class="relatorio-kpis" aria-label="Indicadores principais">
          <div class="relatorio-kpi">
            <span class="relatorio-kpi-label">Histórias concluídas</span>
            <strong class="relatorio-kpi-valor">${historias}</strong>
          </div>
          <div class="relatorio-kpi">
            <span class="relatorio-kpi-label">Tempo de leitura</span>
            <strong class="relatorio-kpi-valor">${formatarTempoLeitura(tempo)}</strong>
          </div>
          <div class="relatorio-kpi">
            <span class="relatorio-kpi-label">Atividades realizadas</span>
            <strong class="relatorio-kpi-valor">${minigames}</strong>
          </div>
          <div class="relatorio-kpi">
            <span class="relatorio-kpi-label">Taxa de acerto</span>
            <strong class="relatorio-kpi-valor">${taxaAcerto == null ? '—' : taxaAcerto + '%'}</strong>
          </div>
        </section>

        <section class="relatorio-detalhes" aria-label="Complemento do relatório">
          <h5 class="relatorio-secao-titulo">Complemento</h5>
          <div class="relatorio-grupos">
            <div class="relatorio-grupo">
              <h6 class="relatorio-grupo-titulo">Leitura</h6>
              <table class="relatorio-tabela relatorio-tabela--compacta">
                <tbody>
                  <tr><th scope="row">Pontuação acumulada</th><td>${estrelas} ${estrelas === 1 ? 'estrela' : 'estrelas'}</td></tr>
                  <tr><th scope="row">Tempo médio por história</th><td>${mediaMinPorHistoria == null ? '—' : mediaMinPorHistoria + ' min'}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="relatorio-grupo">
              <h6 class="relatorio-grupo-titulo">Atividades</h6>
              <div class="relatorio-desempenho" aria-hidden="${totalRespostas === 0 ? 'true' : 'false'}">
                <div class="relatorio-desempenho-bar">
                  <span class="relatorio-desempenho-acertos" style="width:${totalRespostas ? Math.round((acertos / totalRespostas) * 100) : 0}%"></span>
                </div>
                <div class="relatorio-desempenho-legenda">
                  <span>Corretas ${acertos}</span>
                  <span>Incorretas ${erros}</span>
                </div>
              </div>
              <table class="relatorio-tabela relatorio-tabela--compacta">
                <tbody>
                  <tr><th scope="row">Atividades a refazer</th><td>${reprovadas}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section class="relatorio-historico" aria-label="Histórico de histórias">
          <h5 class="relatorio-secao-titulo">Histórico de histórias</h5>
          <div class="relatorio-tabela-wrap">
            <table class="relatorio-tabela">
              <thead>
                <tr>
                  <th>História</th>
                  <th>Gênero</th>
                  <th>Data</th>
                  <th>Avaliação</th>
                </tr>
              </thead>
              <tbody>${linhasHistorias}</tbody>
            </table>
          </div>
        </section>
      </article>
    `;
  }

  function limparDadosLocaisCrianca(criancaId) {
    if (!criancaId) return;
    const id = String(criancaId);
    localStorage.removeItem(`mundoHistorias_progresso_${id}`);
    localStorage.removeItem(`mundoHistorias_estado_crianca_${id}`);
    localStorage.removeItem(`mundoHistorias_historias_ia_cache_${id}`);
    try {
      const estado = carregarJSON(CHAVE_ESTADO, {});
      const pid = estado?.perfil?.id || estado?.perfil?.Id;
      if (estado?.perfil && Number(pid) === Number(id)) {
        localStorage.removeItem(CHAVE_ESTADO);
      }
    } catch (_) { }
    try {
      const raw = localStorage.getItem('mundoHistorias_vidas_criancas');
      if (raw) {
        const mapa = JSON.parse(raw);
        delete mapa[id];
        delete mapa[Number(id)];
        localStorage.setItem('mundoHistorias_vidas_criancas', JSON.stringify(mapa));
      }
    } catch (_) { }
  }

  function fecharModalExclusao() {
    const modal = document.getElementById('modal-excluir-conta');
    if (!modal) return;
    modal.classList.add('oculto');
    modal.setAttribute('hidden', '');
    modal.dataset.modo = '';
    const btn = document.getElementById('modal-excluir-confirmar');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Excluir';
    }
  }

  function abrirModalExclusao({ titulo, descricao, nome, modo }) {
    const modal = document.getElementById('modal-excluir-conta');
    if (!modal) return;
    const tituloEl = document.getElementById('modal-excluir-titulo');
    const descEl = document.getElementById('modal-excluir-desc');
    const nomeEl = document.getElementById('modal-excluir-nome');
    if (tituloEl) tituloEl.textContent = titulo;
    if (descEl) descEl.textContent = descricao;
    if (nomeEl) nomeEl.textContent = nome;
    modal.dataset.modo = modo;
    modal.classList.remove('oculto');
    modal.removeAttribute('hidden');
  }

  async function confirmarExclusaoModal() {
    const modal = document.getElementById('modal-excluir-conta');
    const modo = modal?.dataset?.modo;
    const btn = document.getElementById('modal-excluir-confirmar');
    const sessao = getSessaoResponsavel();
    if (!sessao?.responsavelId || !modo) return;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Excluindo...';
    }

    try {
      if (modo === 'crianca') {
        const crianca = obterCriancaSelecionada('config-crianca-select');
        if (!crianca) {
          setConfigMsg('Selecione uma criança para excluir.', '');
          fecharModalExclusao();
          return;
        }
        const criancaId = crianca.id || crianca.Id;
        await apiRequest(
          `/api/v1/children/${encodeURIComponent(criancaId)}/excluir`,
          'POST',
          { responsavelId: Number(sessao.responsavelId) }
        );
        limparDadosLocaisCrianca(criancaId);
        criancasConfig = criancasConfig.filter((c) => Number(c.id || c.Id) !== Number(criancaId));
        preencherSelectCriancas(document.getElementById('config-relatorio-crianca'), criancasConfig, 'Nenhuma criança cadastrada');
        preencherSelectCriancas(document.getElementById('config-crianca-select'), criancasConfig, 'Nenhuma criança cadastrada');
        if (criancasConfig.length) {
          const proxima = criancasConfig[0];
          const selectRel = document.getElementById('config-relatorio-crianca');
          const selectCri = document.getElementById('config-crianca-select');
          if (selectRel) selectRel.value = String(proxima.id || proxima.Id);
          if (selectCri) selectCri.value = String(proxima.id || proxima.Id);
          preencherFormCriancaConfig(proxima);
          atualizarPreviasAvatar(proxima);
          await carregarRelatorioCrianca(sessao.responsavelId, proxima);
        } else {
          const nomeEl = document.getElementById('config-crianca-nome');
          const nascEl = document.getElementById('config-crianca-nascimento');
          const horarioEl = document.getElementById('config-crianca-horario');
          if (nomeEl) nomeEl.value = '';
          if (nascEl) nascEl.value = '';
          if (horarioEl) horarioEl.value = '';
          atualizarPreviasAvatar(null);
          const cont = document.getElementById('config-relatorios-conteudo');
          if (cont) cont.innerHTML = '<p class="relatorio-estado">Cadastre um perfil infantil para gerar o relatório de acompanhamento.</p>';
        }
        fecharModalExclusao();
        setConfigMsg('', 'O perfil da criança foi excluído.');
        return;
      }

      if (modo === 'responsavel') {
        criancasConfig.forEach((c) => limparDadosLocaisCrianca(c.id || c.Id));
        await apiRequest(`/api/v1/parents/${encodeURIComponent(sessao.responsavelId)}/excluir`, 'POST');
        localStorage.removeItem(CHAVE_SESSAO);
        localStorage.removeItem(CHAVE_ESTADO);
        window.location.href = 'login.html';
      }
    } catch (e) {
      fecharModalExclusao();
      setConfigMsg(e.message || 'Não foi possível concluir a exclusão.', '');
    }
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
        if (secao === 'relatorios') {
          const crianca = obterCriancaSelecionada('config-relatorio-crianca');
          atualizarPreviasAvatar(crianca);
          const sessao = getSessaoResponsavel();
          if (sessao?.responsavelId && crianca) {
            carregarRelatorioCrianca(sessao.responsavelId, crianca);
          }
        }
        if (secao === 'crianca') {
          atualizarPreviasAvatar(obterCriancaSelecionada('config-crianca-select'));
        }
      };
    });
  }

  function configurarEventosConfig() {
    document.querySelectorAll('#config-genero-grupo .chip').forEach(btn => {
      btn.onclick = () => selecionarGeneroConfig(btn.dataset.genero);
    });
    document.querySelectorAll('#config-avatar-grid .avatar-btn').forEach(btn => {
      btn.onclick = () => {
        selecionarAvatarConfig(btn.dataset.av);
        persistirAvatarImediatamente(btn.dataset.av);
      };
    });

    const selectRelatorio = document.getElementById('config-relatorio-crianca');
    if (selectRelatorio) {
      selectRelatorio.onchange = async () => {
        const sessao = getSessaoResponsavel();
        const crianca = obterCriancaSelecionada('config-relatorio-crianca');
        atualizarPreviasAvatar(crianca);
        if (sessao?.responsavelId) await carregarRelatorioCrianca(sessao.responsavelId, crianca);
      };
    }

    const selectCrianca = document.getElementById('config-crianca-select');
    if (selectCrianca) {
      selectCrianca.onchange = () => {
        const crianca = obterCriancaSelecionada('config-crianca-select');
        if (crianca) preencherFormCriancaConfig(crianca);
        atualizarPreviasAvatar(crianca);
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
          setConfigMsg('', 'Pronto, salvamos seus dados.');
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
          atualizarPreviasAvatar(atualizado);
          await carregarRelatorioCrianca(sessao.responsavelId, atualizado);
          setConfigMsg('', 'Pronto, salvamos o perfil da criança.');
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

    const btnExcluirCrianca = document.getElementById('btn-excluir-crianca');
    if (btnExcluirCrianca) {
      btnExcluirCrianca.onclick = () => {
        const crianca = obterCriancaSelecionada('config-crianca-select');
        if (!crianca) {
          setConfigMsg('Selecione uma criança para excluir.', '');
          return;
        }
        const nome = crianca.nome || crianca.Nome || 'esta criança';
        abrirModalExclusao({
          titulo: 'Excluir criança',
          descricao: 'Isso apaga o perfil e todos os dados desta criança no banco (progresso, relatórios e histórias de IA). Os outros perfis e a sua conta continuam.',
          nome,
          modo: 'crianca'
        });
      };
    }

    const btnExcluirConta = document.getElementById('btn-excluir-conta-responsavel');
    if (btnExcluirConta) {
      btnExcluirConta.onclick = () => {
        const sessao = getSessaoResponsavel();
        if (!sessao?.responsavelId) {
          window.location.href = 'login.html';
          return;
        }
        const nomeResp = [
          document.getElementById('config-resp-nome')?.value.trim(),
          document.getElementById('config-resp-sobrenome')?.value.trim()
        ].filter(Boolean).join(' ') || sessao.nome || sessao.Nome || 'sua conta';
        const nomesCriancas = criancasConfig
          .map((c) => c.nome || c.Nome)
          .filter(Boolean);
        const listaCriancas = nomesCriancas.length
          ? ` Também serão excluídas: ${nomesCriancas.join(', ')}.`
          : '';
        abrirModalExclusao({
          titulo: 'Excluir minha conta',
          descricao: `Isso apaga a conta do responsável e todos os dados das crianças associadas no banco.${listaCriancas} Esta ação não pode ser desfeita.`,
          nome: nomeResp,
          modo: 'responsavel'
        });
      };
    }

    const btnCancelarExclusao = document.getElementById('modal-excluir-cancelar');
    if (btnCancelarExclusao) btnCancelarExclusao.onclick = fecharModalExclusao;

    const btnConfirmarExclusao = document.getElementById('modal-excluir-confirmar');
    if (btnConfirmarExclusao) btnConfirmarExclusao.onclick = confirmarExclusaoModal;

    const modalExclusao = document.getElementById('modal-excluir-conta');
    if (modalExclusao) {
      modalExclusao.addEventListener('click', (e) => {
        if (e.target === modalExclusao) fecharModalExclusao();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') fecharModalExclusao();
    });
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
        atualizarPreviasAvatar(criancasConfig[0]);
        await carregarRelatorioCrianca(sessao.responsavelId, criancasConfig[0]);
      } else {
        document.getElementById('config-relatorios-conteudo').innerHTML =
          '<p class="relatorio-estado">Cadastre um perfil infantil para gerar o relatório de acompanhamento.</p>';
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
