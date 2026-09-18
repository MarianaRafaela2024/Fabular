/* =============================================
   MUNDO DAS HISTÓRIAS — avatarUtils.js
   Utilitário global para renderização de avatares (imagens e emojis)
   ============================================= */

'use strict';

/** Pasta e arquivos dos avatares da criança. Troque o PNG em midia/user/ para mudar a arte. */
const PASTA_AVATAR_USUARIO = 'midia/user/';
const AVATAR_PADRAO = PASTA_AVATAR_USUARIO + 'sapo.png';
const ARQUIVOS_AVATAR_USUARIO = new Set([
  'sapo.png',
  'unicornio.png',
  'jacare.png',
  'tubarao.png',
  'porco.png',
  'pato.png',
  'gato.png',
  'urso.png'
]);
const AVATAR_ALIAS = {
  'lion.png': 'urso.png',
  'frog.png': 'sapo.png',
  'butterfly.png': 'unicornio.png',
  'sea-turtle.png': 'jacare.png',
  'fox.png': 'gato.png',
  'penguin.png': 'pato.png',
  'dragon.png': 'tubarao.png',
  'panda.png': 'porco.png'
};

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
 * Garante o caminho atual em midia/user/, inclusive para perfis salvos com o path antigo (midia/lion.png).
 * @param {string} avatar
 * @returns {string}
 */
function normalizarCaminhoAvatar(avatar) {
  const av = String(avatar || '').trim();
  if (!av) return AVATAR_PADRAO;
  if (!ehCaminhoImagem(av)) return av;
  const nome = av.split(/[/\\]/).pop().toLowerCase().replace(/\s+/g, '');
  const mapeado = AVATAR_ALIAS[nome] || nome;
  if (ARQUIVOS_AVATAR_USUARIO.has(mapeado)) {
    return PASTA_AVATAR_USUARIO + mapeado;
  }
  return av;
}

/**
 * Retorna o HTML adequado para exibir o avatar (seja imagem ou emoji).
 * @param {string} avatar
 * @param {string} extraClass
 * @param {string} altText
 * @returns {string}
 */
function renderizarAvatarHTML(avatar, extraClass = '', altText = 'Avatar') {
  const av = normalizarCaminhoAvatar(avatar);
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

if (typeof window !== 'undefined') {
  window.AVATAR_PADRAO = AVATAR_PADRAO;
  window.normalizarCaminhoAvatar = normalizarCaminhoAvatar;
}
