/* =============================================
   MUNDO DAS HISTÓRIAS — libraryView.js (View)
   ============================================= */

'use strict';

function renderizarBiblioteca() {
  const grid = document.getElementById('historias-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const faixaPerfil = parseInt(estado?.perfil?.faixa, 10) || 1;

  let lista = HISTORIAS.filter(h => {
    if (typeof historiaVisivelParaCriancaAtual === 'function' && !historiaVisivelParaCriancaAtual(h)) {
      return false;
    }
    const okGenero = estado.filtroGenero === 'todos' || String(h.genero).toLowerCase() === String(estado.filtroGenero).toLowerCase();
    const okFaixaFiltro = estado.filtroFaixa === 'todos' || parseInt(h.faixa, 10) === parseInt(estado.filtroFaixa, 10);
    return okGenero && okFaixaFiltro;
  });

  if (lista.length === 0) {
    grid.innerHTML = '<p class="vazio-msg" style="grid-column:1/-1">Não achei história com isso. Quer tentar outro gênero?</p>';
    return;
  }

  lista.forEach((h, i) => {
    const concluida = (estado.historiasLidas || []).find(r => r.id === h.id || (typeof normalizarIdHistoria === 'function' && normalizarIdHistoria(r.id) === normalizarIdHistoria(h.id)));
    const estrelas = concluida ? concluida.estrelas : 0;
    const card = document.createElement('div');
    card.className = 'historia-card';
    card.style.animationDelay = (i * 0.05) + 's';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${h.titulo}, gênero ${h.genero}, faixa ${h.faixa}`);

    const srcCapa = typeof resolverImagemCapa === 'function' ? resolverImagemCapa(h) : null;
    const capaHtml = srcCapa
      ? `<img src="${srcCapa}" alt="${h.titulo}" class="hc-capa-img" onerror="this.parentElement.classList.add('hc-emoji--placeholder'); this.remove();">`
      : `${h.emoji}`;

    const meta = [labelGenero(h.genero), h.duracao].filter(Boolean).join(' · ');
    const badges = [
      (h.origem === 'ia' || h.criancaId) ? '<span class="hc-tag ia-badge">Criada agora</span>' : '',
      String(h.id).startsWith('local-') ? '<span class="hc-tag ia-badge ia-badge-local" title="Salva neste aparelho — vincule o perfil ao responsável para sincronizar">Neste aparelho</span>' : '',
      concluida ? '<span class="hc-tag concluida">Já lida</span>' : ''
    ].filter(Boolean).join('');

    card.innerHTML = `
      <div class="hc-emoji">${capaHtml}</div>
      <div class="hc-corpo">
        <div class="hc-titulo">${h.titulo}</div>
        <p class="hc-meta">${meta}</p>
        ${badges ? `<div class="hc-tags">${badges}</div>` : ''}
        <div class="hc-rodape">
          <span class="hc-estrelas">${renderEstrelas(estrelas, 5)}</span>
          <button class="hc-jogar" aria-label="Ler ${h.titulo}">Ler</button>
        </div>
      </div>
    `;

    const jogar = card.querySelector('.hc-jogar');
    jogar.addEventListener('click', (e) => { e.stopPropagation(); iniciarHistoria(h.id); });
    card.addEventListener('click', () => iniciarHistoria(h.id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') iniciarHistoria(h.id); });

    grid.appendChild(card);
  });
}

function labelGenero(g) {
  const m = { narrativo: 'Narrativo', poetico: 'Poético', instrucional: 'Instrucional', descritivo: 'Descritivo', informativo: 'Informativo' };
  return m[g] || g;
}

function labelFaixa(f) {
  return { 1: '5–6 anos', 2: '7–8 anos', 3: '9–10 anos' }[f] || '';
}

function renderEstrelas(ganhas, total = 5) {
  const n = Math.max(0, Math.min(total, Number(ganhas) || 0));
  let html = `<span class="estrelas-rating estrelas-rating--img" aria-label="${n} de ${total} estrelas">`;
  for (let i = 0; i < total; i++) {
    html += `<img src="midia/estrela.png" alt="" class="estrela-icon ${i < n ? 'estrela-preenchida-img' : 'estrela-vazia-img'}" width="18" height="18">`;
  }
  return html + '</span>';
}

function inicializarFiltros() {
  document.querySelectorAll('#filtro-genero .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#filtro-genero .chip').forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      estado.filtroGenero = btn.dataset.filtroGenero;
      renderizarBiblioteca();
    });
  });

  document.querySelectorAll('#filtro-faixa .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#filtro-faixa .chip').forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      estado.filtroFaixa = btn.dataset.filtroFaixa;
      renderizarBiblioteca();
    });
  });
}

function aplicarFaixaDoPerfilNosFiltros() {
  const faixaPerfil = String(parseInt(estado?.perfil?.faixa, 10) || 1);
  estado.filtroFaixa = faixaPerfil;

  const chipsFaixa = document.querySelectorAll('#filtro-faixa .chip');
  chipsFaixa.forEach(btn => {
    const ehFaixaPerfil = btn.dataset.filtroFaixa === faixaPerfil;
    btn.classList.toggle('ativo', ehFaixaPerfil);
    btn.disabled = !ehFaixaPerfil;
    btn.setAttribute('aria-disabled', String(!ehFaixaPerfil));
    if (!ehFaixaPerfil) {
      btn.classList.add('desabilitado');
    } else {
      btn.classList.remove('desabilitado');
    }
  });
}
