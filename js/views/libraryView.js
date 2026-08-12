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
    const okGenero = estado.filtroGenero === 'todos' || h.genero === estado.filtroGenero;
    const okFaixaPerfil = parseInt(h.faixa, 10) === faixaPerfil;
    const okFaixaFiltro = estado.filtroFaixa === 'todos' || parseInt(h.faixa, 10) === parseInt(estado.filtroFaixa, 10);
    return okGenero && okFaixaPerfil && okFaixaFiltro;
  });

  if (lista.length === 0) {
    grid.innerHTML = '<p class="vazio-msg" style="grid-column:1/-1">Nenhuma história encontrada com esses filtros. Tente outros! 🔍</p>';
    return;
  }

  lista.forEach((h, i) => {
    const concluida = estado.historiasLidas.find(r => r.id === h.id);
    const estrelas = concluida ? concluida.estrelas : 0;
    const card = document.createElement('div');
    card.className = 'historia-card';
    card.style.animationDelay = (i * 0.05) + 's';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${h.titulo}, gênero ${h.genero}, faixa ${h.faixa}`);

    card.innerHTML = `
      <div class="hc-emoji">${h.emoji}</div>
      <div class="hc-titulo">${h.titulo}</div>
      <div class="hc-tags">
        <span class="hc-tag genero">${labelGenero(h.genero)}</span>
        <span class="hc-tag faixa">${labelFaixa(h.faixa)}</span>
        <span class="hc-tag duracao">⏱ ${h.duracao}</span>
        ${String(h.id).startsWith('api-') ? '<span class="hc-tag ia-badge">🤖 IA</span>' : ''}
        ${String(h.id).startsWith('local-') ? '<span class="hc-tag ia-badge ia-badge-local" title="Salva localmente — vincule o perfil ao responsável para sincronizar">🤖 IA · local</span>' : ''}
        ${concluida ? `<span class="hc-tag concluida">✅ Concluída</span>` : ''}
      </div>
      <div class="hc-rodape">
        <span class="hc-estrelas">${renderEstrelas(estrelas, 5)}</span>
        <button class="hc-jogar" aria-label="Jogar ${h.titulo}">Jogar 🎮</button>
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
  const m = { narrativo:'📖 Narrativo', poetico:'🎵 Poético', instrucional:'📋 Instrucional', descritivo:'🔍 Descritivo', informativo:'💡 Informativo' };
  return m[g] || g;
}

function labelFaixa(f) {
  return { 1:'5–6 anos', 2:'7–8 anos', 3:'9–10 anos' }[f] || '';
}

function renderEstrelas(ganhas, total = 5) {
  const n = Math.max(0, Math.min(total, Number(ganhas) || 0));
  let html = `<span class="estrelas-rating" aria-label="${n} de ${total} estrelas">`;
  for (let i = 0; i < total; i++) {
    html += `<span class="estrela-icon ${i < n ? 'estrela-preenchida' : 'estrela-vazia'}" aria-hidden="true">★</span>`;
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
