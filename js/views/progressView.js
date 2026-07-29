/* =============================================
   MUNDO DAS HISTÓRIAS — progressView.js (View)
   ============================================= */

'use strict';

let calendarioMesAtual = new Date();

function atualizarTelaProgresso() {
  const p = estado.perfil;
  const ppAvatar = document.getElementById('pp-avatar');
  const ppNome = document.getElementById('pp-nome');
  const ppNivelBadge = document.getElementById('pp-nivel-badge');
  const ppTotal = document.getElementById('pp-total');
  const progressoSub = document.getElementById('progresso-sub');

  if (ppAvatar) ppAvatar.textContent = p.avatar;
  if (ppNome) ppNome.textContent = p.nome;
  if (ppNivelBadge) ppNivelBadge.textContent = labelNivel(estado.nivel);
  if (ppTotal) ppTotal.textContent = estado.totalEstrelas + ' ⭐';
  const acertosMG = Number(estado.acertosMG) || 0;
  const errosMG = Number(estado.errosMG) || 0;
  const naoOuco = Number(estado.naoConsigoOuvir) || 0;
  if (progressoSub) {
    progressoSub.textContent =
      `Olá, ${p.nome}! Você tem ${estado.totalEstrelas || 0} estrela${estado.totalEstrelas === 1 ? '' : 's'} — continue lendo e jogando para evoluir!`;
  }

  atualizarBarraExperiencia();

  const cont = document.getElementById('historias-concluidas');
  if (cont) {
    cont.innerHTML = '';
    if (estado.historiasLidas.length === 0) {
      cont.innerHTML = '<p class="vazio-msg">Nenhuma história concluída ainda. Comece a ler! 📚</p>';
    } else {
      estado.historiasLidas.forEach(r => {
        const h = HISTORIAS.find(x => x.id === r.id);
        if (!h) return;
        const item = document.createElement('div');
        item.className = 'historia-concluida-item';
        item.innerHTML = `
          <div class="hci-esq">
            <span class="hci-emoji">${h.emoji}</span>
            <div class="hci-info">
              <span class="hci-titulo">${h.titulo}</span>
              <span class="hci-genero">${labelGenero(h.genero)} · ${r.data || ''}</span>
            </div>
          </div>
          <span class="hci-estrelas">${renderEstrelas(r.estrelas, 3)}</span>
        `;
        cont.appendChild(item);
      });
    }
  }

  renderizarCalendarioAtividade();

  const progHistorias = document.getElementById('prog-historias');
  const progTempo = document.getElementById('prog-tempo');
  const progEstrelas = document.getElementById('prog-estrelas');
  const progMinigames = document.getElementById('prog-minigames');
  if (progHistorias) progHistorias.textContent = estado.historiasLidas.length;
  if (progTempo) progTempo.textContent = estado.tempoTotal + ' min';
  if (progEstrelas) progEstrelas.textContent = estado.totalEstrelas;
  if (progMinigames) progMinigames.textContent = estado.minigamesJogados;

  renderizarAcessoRelatorioResponsavel({ acertosMG, errosMG, naoOuco });
}

function renderizarAcessoRelatorioResponsavel(metricas) {
  const secoes = document.getElementById('area-relatorio-responsavel');
  if (!secoes) return;
  let bloco = document.getElementById('prog-extra-relatorio');
  if (!bloco) {
    bloco = document.createElement('div');
    bloco.id = 'prog-extra-relatorio';
    bloco.className = 'progresso-secao';
    secoes.appendChild(bloco);
  }

  //const sessaoResponsavel = (() => {
 //   try {
 //    const raw = localStorage.getItem('mundoHistorias_responsavel_sessao');
 //     return raw ? JSON.parse(raw) : null;
//} catch (_) {
 //     return null;
 //   }
 // })();

  if (!sessaoResponsavel || !sessaoResponsavel.email) {
    bloco.innerHTML = '';
    return;
  }

  bloco.innerHTML = `
    <h3>📄 Relatório do Responsável</h3>
    <div class="stats-grid" id="stats-relatorio-grid">
      <div class="stat-card-prog"><span class="scp-icon">❌</span><span class="scp-valor">${estado.tentativasReprovadas || 0}</span><span class="scp-label">Tentativas reprovadas</span></div>
      <div class="stat-card-prog"><span class="scp-icon">✅</span><span class="scp-valor">${metricas.acertosMG}</span><span class="scp-label">Acertos MG</span></div>
      <div class="stat-card-prog"><span class="scp-icon">⚠️</span><span class="scp-valor">${metricas.errosMG}</span><span class="scp-label">Erros MG</span></div>
      <div class="stat-card-prog"><span class="scp-icon">🔊</span><span class="scp-valor">${metricas.naoOuco}</span><span class="scp-label">Não consigo ouvir</span></div>
    </div>
  `;
}

function agruparAtividadePorDia() {
  const mapa = {};
  (estado.historiasLidas || []).forEach((r) => {
    const iso = obterDataIsoHistoria(r);
    if (!iso || !(Number(r.estrelas) > 0)) return;
    mapa[iso] = (mapa[iso] || 0) + 1;
  });
  if (Array.isArray(estado.atividadeDiaria)) {
    estado.atividadeDiaria.forEach((a) => {
      if (!a || !a.data) return;
      const qtd = Number(a.quantidade) || 0;
      if (qtd > 0) mapa[a.data] = Math.max(mapa[a.data] || 0, qtd);
    });
  }
  return mapa;
}

function nivelAtividadeDia(qtd) {
  if (!qtd) return 0;
  if (qtd === 1) return 1;
  if (qtd === 2) return 2;
  if (qtd === 3) return 3;
  return 4;
}

function renderizarCalendarioAtividade() {
  const el = document.getElementById('calendario-atividade');
  if (!el) return;

  const MESES_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const atividade = agruparAtividadePorDia();
  const ano = calendarioMesAtual.getFullYear();
  const mes = calendarioMesAtual.getMonth();
  const hojeIso = new Date().toISOString().slice(0, 10);
  const offset = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  let grade = '';
  let totalMes = 0;
  for (let i = 0; i < offset; i++) {
    grade += '<div class="cal-dia cal-dia-vazio" aria-hidden="true"></div>';
  }
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const iso = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const qtd = atividade[iso] || 0;
    totalMes += qtd;
    const nivel = nivelAtividadeDia(qtd);
    const futuro = iso > hojeIso;
    const hoje = iso === hojeIso;
    const classes = [
      'cal-dia',
      nivel ? `cal-dia-nivel-${nivel}` : '',
      futuro ? 'cal-dia-futuro' : '',
      hoje ? 'cal-dia-hoje' : ''
    ].filter(Boolean).join(' ');
    const label = qtd
      ? `${dia} — ${qtd} história${qtd > 1 ? 's' : ''} concluída${qtd > 1 ? 's' : ''}`
      : `${dia} — sem atividade`;
    grade += `<div class="${classes}" role="gridcell" aria-label="${label}" title="${label}">${dia}</div>`;
  }

  const tituloMes = `${MESES_PT[mes]} ${ano}`;
  el.innerHTML = `
    <div class="calendario-header">
      <div class="calendario-titulo">${tituloMes}</div>
      <div class="calendario-nav">
        <button type="button" class="calendario-nav-btn" id="cal-prev" aria-label="Mês anterior">‹</button>
        <button type="button" class="calendario-nav-btn" id="cal-prox" aria-label="Próximo mês">›</button>
      </div>
    </div>
    <div class="calendario-semana" aria-hidden="true">
      ${DIAS_SEMANA.map((d) => `<span class="calendario-dia-semana">${d}</span>`).join('')}
    </div>
    <div class="calendario-grade" role="grid" aria-label="Calendário de histórias concluídas em ${tituloMes}">
      ${grade}
    </div>
    <div class="calendario-legenda">
      <span>Menos</span>
      <div class="calendario-legenda-cores">
        <span class="cal-legenda-amostra" style="background:#F3F4F6"></span>
        <span class="cal-legenda-amostra cal-dia-nivel-1"></span>
        <span class="cal-legenda-amostra cal-dia-nivel-2"></span>
        <span class="cal-legenda-amostra cal-dia-nivel-3"></span>
        <span class="cal-legenda-amostra cal-dia-nivel-4"></span>
      </div>
      <span>Mais</span>
    </div>
    <p class="calendario-resumo">${totalMes > 0
      ? `${totalMes} história${totalMes > 1 ? 's' : ''} concluída${totalMes > 1 ? 's' : ''} neste mês`
      : 'Nenhuma história concluída neste mês ainda'}</p>
  `;

  document.getElementById('cal-prev')?.addEventListener('click', () => {
    calendarioMesAtual = new Date(ano, mes - 1, 1);
    renderizarCalendarioAtividade();
  });
  document.getElementById('cal-prox')?.addEventListener('click', () => {
    calendarioMesAtual = new Date(ano, mes + 1, 1);
    renderizarCalendarioAtividade();
  });
}

const ETAGES_RAPOSA = [
  {
    id: 'filhote',
    nome: 'Raposa Filhote',
    minEstrelas: 0,
    maxEstrelas: 10,
    imagem: 'midia/raposa/raposa1.png',
    mensagem: 'Sua raposinha acabou de nascer! Continue lendo histórias e completando minigames para ajudá-la a crescer. 🦊🌱'
  },
  {
    id: 'jovem',
    nome: 'Raposa Jovem',
    minEstrelas: 10,
    maxEstrelas: 25,
    imagem: 'midia/raposa/raposa2.png',
    mensagem: 'Sua raposa está crescendo forte e curiosa! Continue praticando para ver o próximo estágio. 🌿✨'
  },
  {
    id: 'aventureira',
    nome: 'Raposa Aventureira',
    minEstrelas: 25,
    maxEstrelas: 45,
    imagem: 'midia/raposa/raposa3.png',
    mensagem: 'Que incrível! Sua raposa agora é uma grande aventureira explorando novos mundos! 🎒🌳'
  },
  {
    id: 'mestre',
    nome: 'Raposa Mestre',
    minEstrelas: 45,
    maxEstrelas: Infinity,
    imagem: 'midia/raposa/raposa4.png',
    mensagem: 'Parabéns! Sua raposa atingiu a sabedoria máxima e se tornou uma grande Mestre! 🏆👑'
  }
];

function obterEstagioRaposa(estrelas) {
  const e = Math.max(0, Number(estrelas !== undefined ? estrelas : estado.totalEstrelas) || 0);
  if (e >= 45) return ETAGES_RAPOSA[3];
  if (e >= 25) return ETAGES_RAPOSA[2];
  if (e >= 10) return ETAGES_RAPOSA[1];
  return ETAGES_RAPOSA[0];
}

function labelNivel(n) {
  const estagio = obterEstagioRaposa(estado.totalEstrelas);
  return estagio ? estagio.nome : 'Raposa Filhote';
}

function atualizarBarraExperiencia() {
  atualizarEvolucaoRaposa();
}

function atualizarEvolucaoRaposa() {
  const total = estado.totalEstrelas || 0;
  const estagio = obterEstagioRaposa(total);

  const imgEl = document.getElementById('raposa-img');
  const nomeEl = document.getElementById('raposa-fase-nome');
  const msgEl = document.getElementById('raposa-mensagem');
  const badgeEl = document.getElementById('raposa-fase-badge');
  const estrelasTextoEl = document.getElementById('raposa-estrelas-texto');
  const proximoTextoEl = document.getElementById('raposa-proximo-texto');
  const fillEl = document.getElementById('raposa-bar-fill');

  if (imgEl) {
    imgEl.src = estagio.imagem;
    imgEl.alt = estagio.nome;
  }
  if (nomeEl) nomeEl.textContent = estagio.nome;
  if (msgEl) msgEl.textContent = estagio.mensagem;
  if (badgeEl) badgeEl.textContent = `🦊 ${estagio.nome}`;

  if (estagio.maxEstrelas === Infinity) {
    if (estrelasTextoEl) estrelasTextoEl.textContent = `${total} ⭐ acumuladas`;
    if (proximoTextoEl) proximoTextoEl.textContent = 'Estágio Máximo Alcançado! 🏆';
    if (fillEl) fillEl.style.width = '100%';
  } else {
    const estrelasNoEstagio = total - estagio.minEstrelas;
    const alcanceEstagio = estagio.maxEstrelas - estagio.minEstrelas;
    const faltam = estagio.maxEstrelas - total;
    const pct = Math.min(100, Math.max(0, Math.round((estrelasNoEstagio / alcanceEstagio) * 100)));

    const proximoEstagio = ETAGES_RAPOSA.find(e => e.minEstrelas === estagio.maxEstrelas);
    const nomeProximo = proximoEstagio ? proximoEstagio.nome : 'Próximo Estágio';

    if (estrelasTextoEl) estrelasTextoEl.textContent = `${total} / ${estagio.maxEstrelas} ⭐`;
    if (proximoTextoEl) proximoTextoEl.textContent = `Faltam ${faltam} ⭐ para ${nomeProximo}`;
    if (fillEl) fillEl.style.width = `${pct}%`;
  }

  const estagiosIds = ['filhote', 'jovem', 'aventureira', 'mestre'];
  const indexAtual = ETAGES_RAPOSA.findIndex(e => e.id === estagio.id);
  estagiosIds.forEach((id, index) => {
    const el = document.getElementById('res-' + id);
    if (el) el.classList.toggle('ativo', index <= indexAtual);
  });
}
