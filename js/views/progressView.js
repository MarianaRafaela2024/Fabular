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
    if (!estado.historiasLidas || estado.historiasLidas.length === 0) {
      cont.innerHTML = '<p class="vazio-msg">Nenhuma história concluída ainda. Comece a ler! 📚</p>';
    } else {
      estado.historiasLidas.forEach(r => {
        if (!r || r.id == null) return;
        const h = (typeof HISTORIAS !== 'undefined' ? HISTORIAS : []).find(x => String(x.id) === String(r.id));
        const titulo = h ? h.titulo : (r.titulo || 'História Concluída');
        const emoji = h ? h.emoji : (r.emoji || '📖');
        const generoRaw = h ? h.genero : (r.genero || 'narrativo');
        const genero = typeof labelGenero === 'function' ? labelGenero(generoRaw) : generoRaw;
        const dataStr = r.data || (r.dataIso ? new Date(r.dataIso + 'T00:00:00').toLocaleDateString('pt-BR') : '');

        const item = document.createElement('div');
        item.className = 'historia-concluida-item';
        item.innerHTML = `
          <div class="hci-esq">
            <span class="hci-emoji">${emoji}</span>
            <div class="hci-info">
              <span class="hci-titulo">${titulo}</span>
              <span class="hci-genero">${genero}${dataStr ? ' · ' + dataStr : ''}</span>
            </div>
          </div>
          <span class="hci-estrelas">${typeof renderEstrelas === 'function' ? renderEstrelas(r.estrelas, 5) : '⭐'.repeat(Number(r.estrelas) || 1)}</span>
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
  if (progHistorias) progHistorias.textContent = (estado.historiasLidas || []).length;
  if (progTempo) progTempo.textContent = (estado.tempoTotal || 0) + ' min';
  if (progEstrelas) progEstrelas.textContent = estado.totalEstrelas || 0;
  if (progMinigames) progMinigames.textContent = estado.minigamesJogados || 0;

  renderizarAcessoRelatorioResponsavel({ acertosMG, errosMG, naoOuco });
}

function renderizarAcessoRelatorioResponsavel(metricas) {
  const secoes = document.getElementById('area-relatorio-responsavel');
  if (!secoes) return;

  const nomeCrianca = estado.perfil?.nome || 'Criança';
  const totalHistorias = (estado.historiasLidas || []).length;
  const totalEstrelas = estado.totalEstrelas || 0;
  const tempoTotal = estado.tempoTotal || 0;

  let historiasHtml = '';
  if (!estado.historiasLidas || estado.historiasLidas.length === 0) {
    historiasHtml = '<p class="vazio-msg">Nenhuma história concluída ainda. Comece a ler! 📚</p>';
  } else {
    historiasHtml = '<div class="historias-concluidas">';
    estado.historiasLidas.forEach(r => {
      if (!r || r.id == null) return;
      const h = (typeof HISTORIAS !== 'undefined' ? HISTORIAS : []).find(x => String(x.id) === String(r.id));
      const titulo = h ? h.titulo : (r.titulo || 'História Concluída');
      const emoji = h ? h.emoji : (r.emoji || '📖');
      const genero = h ? (typeof labelGenero === 'function' ? labelGenero(h.genero) : h.genero) : (r.genero || 'Geral');
      const dataStr = r.data || (r.dataIso ? new Date(r.dataIso + 'T00:00:00').toLocaleDateString('pt-BR') : '');
      const estrelasHtml = typeof renderEstrelas === 'function' ? renderEstrelas(r.estrelas, 5) : '⭐'.repeat(Number(r.estrelas) || 1);

      historiasHtml += `
        <div class="historia-concluida-item">
          <div class="hci-esq">
            <span class="hci-emoji">${emoji}</span>
            <div class="hci-info">
              <span class="hci-titulo">${titulo}</span>
              <span class="hci-genero">${genero}${dataStr ? ' · ' + dataStr : ''}</span>
            </div>
          </div>
          <span class="hci-estrelas">${estrelasHtml}</span>
        </div>
      `;
    });
    historiasHtml += '</div>';
  }

  secoes.innerHTML = `
    <div class="progresso-secao" id="prog-extra-relatorio">
      <h3>📄 Relatório Geral — ${nomeCrianca}</h3>
      <div class="stats-grid" id="stats-relatorio-grid">
        <div class="stat-card-prog"><span class="scp-icon">📚</span><span class="scp-valor">${totalHistorias}</span><span class="scp-label">Histórias Concluídas</span></div>
        <div class="stat-card-prog"><span class="scp-icon">⭐</span><span class="scp-valor">${totalEstrelas}</span><span class="scp-label">Estrelas Acumuladas</span></div>
        <div class="stat-card-prog"><span class="scp-icon">⏰</span><span class="scp-valor">${tempoTotal} min</span><span class="scp-label">Tempo Total</span></div>
        <div class="stat-card-prog"><span class="scp-icon">❌</span><span class="scp-valor">${estado.tentativasReprovadas || 0}</span><span class="scp-label">Tentativas reprovadas</span></div>
        <div class="stat-card-prog"><span class="scp-icon">✅</span><span class="scp-valor">${metricas.acertosMG}</span><span class="scp-label">Acertos MG</span></div>
        <div class="stat-card-prog"><span class="scp-icon">⚠️</span><span class="scp-valor">${metricas.errosMG}</span><span class="scp-label">Erros MG</span></div>
        <div class="stat-card-prog"><span class="scp-icon">🔊</span><span class="scp-valor">${metricas.naoOuco}</span><span class="scp-label">Não consigo ouvir</span></div>
      </div>
    </div>

    <div class="progresso-secao progresso-secao-historias">
      <h3>📖 Histórias Concluídas no Relatório</h3>
      <div class="historias-concluidas-wrap">
        ${historiasHtml}
      </div>
    </div>
  `;
}

function agruparAtividadePorDia() {
  const mapa = {};
  (estado.historiasLidas || []).forEach((r) => {
    const iso = obterDataIsoHistoria(r);
    if (!iso || !(Number(r.estrelas) > 0)) return;
    const qtdLida = Number(r.vezesLida) || 1;
    mapa[iso] = (mapa[iso] || 0) + qtdLida;
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

function obterEstrelasPorDia(qtd) {
  if (!qtd || qtd <= 0) return '';
  if (qtd === 1) return '⭐';
  if (qtd === 2) return '⭐⭐';
  if (qtd === 3) return '⭐⭐⭐';
  return '⭐⭐⭐⭐';
}

function calcularSequenciaLeitura(atividade) {
  const agora = new Date();
  let d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  let streak = 0;

  const formatIso = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  let iso = formatIso(d);
  if (!atividade[iso] || atividade[iso] <= 0) {
    d.setDate(d.getDate() - 1);
    iso = formatIso(d);
  }

  while (atividade[iso] && atividade[iso] > 0) {
    streak++;
    d.setDate(d.getDate() - 1);
    iso = formatIso(d);
  }

  return streak;
}

const FRASES_MOTIVACIONAIS_RAPOSA = [
  'Cada página que você lê traz uma nova aventura mágica! ',
  'Ler todos os dias deixa sua imaginação super poderosa! ',
  'A raposinha está muito orgulhosa do seu progresso! ',
  'Quanto mais histórias você lê, mais longe você pode voar! ',
  'Aprender lendo é o melhor minigame de todos! ',
  'Você é um verdadeiro campeão das histórias! ',
  'Abrir um livro é abrir uma porta para o mundo dos sonhos!'
];

function obterFraseMotivacionalRaposa(streak, totalMes) {
  if (streak >= 5) return `Nossa! ${streak} dias seguidos lendo! Você é imbatível! `;
  if (streak >= 3) return `Uau! ${streak} dias de leitura seguidos! Continue assim! `;
  if (totalMes >= 10) return `Já foram ${totalMes} histórias este mês! Você lê super bem! `;
  const idx = (totalMes + streak) % FRASES_MOTIVACIONAIS_RAPOSA.length;
  return FRASES_MOTIVACIONAIS_RAPOSA[idx];
}

function exibirModalDetalhesDia(iso, dia, mes, ano, qtd, estrelasStr) {
  let modal = document.getElementById('cal-dia-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cal-dia-modal';
    modal.className = 'cal-modal-overlay';
    document.body.appendChild(modal);
  }

  const MESES_EXTENSO = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dataFormatada = `${dia} de ${MESES_EXTENSO[mes]} de ${ano}`;

  const historiasNoDia = (estado.historiasLidas || []).filter(r => obterDataIsoHistoria(r) === iso);

  let historiasHtml = '';
  if (historiasNoDia.length > 0) {
    // Agrupa histórias lidas no mesmo dia para exibir a contagem de releituras no calendário (ex: 2x lida)
    const mapaDia = new Map();
    historiasNoDia.forEach(r => {
      if (!r || r.id == null) return;
      const key = String(r.id);
      const exist = mapaDia.get(key);
      if (!exist) {
        mapaDia.set(key, {
          id: key,
          titulo: r.titulo || '',
          emoji: r.emoji || '📖',
          estrelas: Number(r.estrelas) || 1,
          qtd: 1
        });
      } else {
        exist.qtd += 1;
        exist.estrelas = Math.max(exist.estrelas, Number(r.estrelas) || 1);
      }
    });

    historiasHtml = '<ul class="cal-modal-historias-lista">';
    mapaDia.forEach(r => {
      const h = (typeof HISTORIAS !== 'undefined' ? HISTORIAS : []).find(x => String(x.id) === String(r.id));
      const titulo = h ? h.titulo : (r.titulo || 'História Concluída');
      const emoji = h ? h.emoji : (r.emoji || '📖');
      const estCount = Math.min(5, Math.max(1, Number(r.estrelas) || 1));
      const est = typeof renderEstrelas === 'function' ? renderEstrelas(estCount, 5) : '⭐'.repeat(estCount);
      const vezesBadge = r.qtd > 1 ? `<span class="cal-modal-vezes" style="margin-left:6px;font-size:0.8rem;background:rgba(255,107,53,0.15);color:#FF6B35;padding:2px 8px;border-radius:12px;font-weight:700;">🔁 ${r.qtd}x lida</span>` : '';

      historiasHtml += `<li><span class="cal-modal-h-emoji">${emoji}</span> <div class="cal-modal-h-info"><strong>${titulo}${vezesBadge}</strong><span class="cal-modal-h-est">${est}</span></div></li>`;
    });
    historiasHtml += '</ul>';
  } else if (qtd > 0) {
    historiasHtml = `<p class="cal-modal-info-texto">📚 ${qtd} história${qtd > 1 ? 's' : ''} concluída${qtd > 1 ? 's' : ''} neste dia!</p>`;
  } else {
    historiasHtml = `<p class="cal-modal-vazio">Nenhuma história lida neste dia ainda. Que tal ler uma hoje? </p>`;
  }


  modal.innerHTML = `
    <div class="cal-modal-card">
      <button type="button" class="cal-modal-fechar" aria-label="Fechar detalhes">✕</button>
      <div class="cal-modal-header">
        <span class="cal-modal-icon">📅</span>
        <div class="cal-modal-data-wrap">
          <h4 class="cal-modal-data">${dataFormatada}</h4>
          <span class="cal-modal-badge-estrelas">${estrelasStr || (qtd > 0 ? '⭐' : 'Sem leitura')}</span>
        </div>
      </div>
      <div class="cal-modal-body">
        <div class="cal-modal-secao">
          <h5 class="cal-modal-subtitulo">📖 Histórias Lidas</h5>
          ${historiasHtml}
        </div>
       
      </div>
    </div>
  `;

  modal.classList.add('ativo');

  const fecharBtn = modal.querySelector('.cal-modal-fechar');
  const fecharModal = () => modal.classList.remove('ativo');

  fecharBtn?.addEventListener('click', fecharModal);
  modal.onclick = (e) => {
    if (e.target === modal) fecharModal();
  };
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
  const streak = calcularSequenciaLeitura(atividade);

  const totalSlots = offset + diasNoMes;
  const numSemanas = Math.ceil(totalSlots / 7);
  const semanasInfo = [];

  for (let s = 0; s < numSemanas; s++) {
    let diasComLeituraNaSemana = 0;
    let diasValidosNaSemana = 0;
    for (let dIndex = s * 7; dIndex < (s + 1) * 7; dIndex++) {
      const diaNum = dIndex - offset + 1;
      if (diaNum >= 1 && diaNum <= diasNoMes) {
        diasValidosNaSemana++;
        const iso = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`;
        if ((atividade[iso] || 0) > 0) {
          diasComLeituraNaSemana++;
        }
      }
    }
    const ehSemanaPerfeita = (diasValidosNaSemana >= 4 && diasComLeituraNaSemana === diasValidosNaSemana);
    semanasInfo.push(ehSemanaPerfeita);
  }

  let temAlgumaSemanaPerfeita = semanasInfo.some(Boolean);

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
    const estrelasStr = obterEstrelasPorDia(qtd);

    const slotIndex = offset + (dia - 1);
    const semanaIndex = Math.floor(slotIndex / 7);
    const ehDiaSemanaPerfeita = semanasInfo[semanaIndex] || false;

    const classes = [
      'cal-dia',
      nivel ? `cal-dia-nivel-${nivel}` : '',
      futuro ? 'cal-dia-futuro' : '',
      hoje ? 'cal-dia-hoje' : '',
      ehDiaSemanaPerfeita ? 'cal-dia-semana-perfeita' : ''
    ].filter(Boolean).join(' ');

    const label = qtd
      ? `${dia} — ${qtd} história${qtd > 1 ? 's' : ''} concluída${qtd > 1 ? 's' : ''} (${estrelasStr})`
      : `${dia} — sem atividade`;

    const ehUltimoDiaDaSemana = ((slotIndex + 1) % 7 === 0) || (dia === diasNoMes && ehDiaSemanaPerfeita);
    const seloHtml = (ehDiaSemanaPerfeita && ehUltimoDiaDaSemana)
      ? '<span class="cal-selo-semana" title="Semana Perfeita de Leitura! 🏆" aria-label="Semana Perfeita">👑</span>'
      : '';

    grade += `
      <div class="${classes}" role="gridcell" tabindex="0" data-iso="${iso}" data-dia="${dia}" data-qtd="${qtd}" aria-label="${label}" title="${label}">
        <span class="cal-dia-num">${dia}</span>
        ${estrelasStr ? `<span class="cal-dia-estrelas" data-qtd="${qtd}" aria-hidden="true">${estrelasStr}</span>` : ''}
        ${hoje ? '<span class="cal-dia-hoje-badge">HOJE</span>' : ''}
        ${seloHtml}
      </div>
    `;
  }

  const tituloMes = `${MESES_PT[mes]} ${ano}`;
  const fraseMotivacional = obterFraseMotivacionalRaposa(streak, totalMes);

  const topoCalendario = streak > 0
    ? `
    <div class="calendario-topo-bar">
      <div class="calendario-streak-badge">
        <span class="icon res-icon fire"></span>

        <div class="cal-streak-info">
          <span class="cal-streak-valor">
            ${streak} ${streak === 1 ? 'dia seguido' : 'dias seguidos'}
          </span>

          <span class="cal-streak-label">
            Sequência de Leitura
          </span>
        </div>
      </div>

      ${temAlgumaSemanaPerfeita
      ? '<div class="calendario-selo-topo">👑 Semana Perfeita!</div>'
      : ''}
    </div>
  `
    : '';

  el.innerHTML = `
  ${topoCalendario}

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
      <span>Menos ⭐</span>
      <div class="calendario-legenda-cores">
        <span class="cal-legenda-amostra" style="background:#F3F4F6"></span>
        <span class="cal-legenda-amostra cal-dia-nivel-1"></span>
        <span class="cal-legenda-amostra cal-dia-nivel-2"></span>
        <span class="cal-legenda-amostra cal-dia-nivel-3"></span>
        <span class="cal-legenda-amostra cal-dia-nivel-4"></span>
      </div>
      <span>Mais ⭐⭐⭐⭐</span>
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

  el.querySelectorAll('.cal-dia:not(.cal-dia-vazio)').forEach(diaEl => {
    const handleDiaClick = () => {
      const iso = diaEl.getAttribute('data-iso');
      const diaNum = Number(diaEl.getAttribute('data-dia'));
      const qtdNum = Number(diaEl.getAttribute('data-qtd')) || 0;
      const est = obterEstrelasPorDia(qtdNum);
      exibirModalDetalhesDia(iso, diaNum, mes, ano, qtdNum, est);
    };
    diaEl.addEventListener('click', handleDiaClick);
    diaEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleDiaClick();
      }
    });
  });
}

const ETAGES_RAPOSA = [
  {
    id: 'filhote',
    nome: 'Raposa Filhote',
    minEstrelas: 0,
    maxEstrelas: 10,
    imagem: 'midia/raposa/raposa1.png',
    mensagem: 'Sua raposinha acabou de nascer! Continue lendo histórias e completando minigames para ajudá-la a crescer. '
  },
  {
    id: 'jovem',
    nome: 'Raposa Jovem',
    minEstrelas: 10,
    maxEstrelas: 25,
    imagem: 'midia/raposa/raposa2.png',
    mensagem: 'Sua raposa está crescendo forte e curiosa! Continue praticando para ver o próximo estágio. '
  },
  {
    id: 'aventureira',
    nome: 'Raposa Aventureira',
    minEstrelas: 25,
    maxEstrelas: 45,
    imagem: 'midia/raposa/raposa3.png',
    mensagem: 'Que incrível! Sua raposa agora é uma grande aventureira explorando novos mundos! '
  },
  {
    id: 'mestre',
    nome: 'Raposa Mestre',
    minEstrelas: 45,
    maxEstrelas: Infinity,
    imagem: 'midia/raposa/raposa4.png',
    mensagem: 'Parabéns! Sua raposa atingiu a sabedoria máxima e se tornou uma grande Mestre! '
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
    if (el) {
      const estaAlcancado = index <= indexAtual;
      el.classList.toggle('ativo', estaAlcancado);
      const iconEl = el.querySelector('.icon');
      if (iconEl) {
        iconEl.classList.toggle('trofeuestrela', estaAlcancado);
        iconEl.classList.toggle('interrogacao', !estaAlcancado);
        iconEl.classList.toggle('interrogação', !estaAlcancado);
      }
    }
  });
}
