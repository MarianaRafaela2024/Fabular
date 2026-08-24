/* =============================================
   MUNDO DAS HISTÓRIAS — avatarUtils.js
   Utilitário global para renderização de avatares (imagens e emojis)
   ============================================= */

'use strict';

/**
 * Verifica se a string fornecida representa um caminho de imagem, URL ou Base64.
 * @param {string} avatar 
 * @returns {boolean}
 */
function ehCaminhoImagem(avatar) {
  if (!avatar || typeof avatar !== 'string') return false;
  const str = avatar.trim().toLowerCase();
  if (
    str.startsWith('midia/') ||
    str.startsWith('./') ||
    str.startsWith('../') ||
    str.startsWith('/') ||
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.startsWith('data:image/') ||
    str.startsWith('blob:')
  ) {
    return true;
  }
  return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(str);
}

/**
 * Retorna o HTML adequado para exibir o avatar (seja imagem ou emoji).
 * @param {string} avatar 
 * @param {string} extraClass 
 * @param {string} altText 
 * @returns {string}
 */
function renderizarAvatarHTML(avatar, extraClass = '', altText = 'Avatar') {
  const av = avatar || 'midia/lion.png';
  if (ehCaminhoImagem(av)) {
    const classeFinal = ('avatar-img-render ' + extraClass).trim();
    return `<img src="${av}" alt="${altText}" class="${classeFinal}">`;
  }
  const classeFinal = ('avatar-emoji-render ' + extraClass).trim();
  return `<span class="${classeFinal}">${av}</span>`;
}

/**
 * Renderiza o avatar dentro de um elemento do DOM.
 * @param {HTMLElement|string} container 
 * @param {string} avatar 
 * @param {string} extraClass 
 * @param {string} altText 
 */
function renderizarElementoAvatar(container, avatar, extraClass = '', altText = 'Avatar') {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;
  el.innerHTML = renderizarAvatarHTML(avatar, extraClass, altText);
}
