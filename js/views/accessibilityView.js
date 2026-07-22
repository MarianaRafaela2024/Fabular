/* =============================================
   MUNDO DAS HISTÓRIAS — accessibilityView.js (View)
   ============================================= */

'use strict';

let tamanhoFonte = 16;
let altoContraste = false;
const CHAVE_MODO_NOTURNO = 'mundoHistorias_modoNoturno';

let ttsAtivo = false;
let ttsUtterance = null;

function ajustarFonte(delta) {
  tamanhoFonte = Math.min(26, Math.max(12, tamanhoFonte + delta));
  document.documentElement.style.fontSize = tamanhoFonte + 'px';
  document.documentElement.style.setProperty('--fonte-base', tamanhoFonte + 'px');
}

function aplicarModoNoturno() {
  document.body.classList.toggle('alto-contraste', altoContraste);
  const btn = document.getElementById('btn-contraste');
  if (btn) btn.classList.toggle('ativo', altoContraste);
}

function carregarModoNoturno() {
  try {
    altoContraste = localStorage.getItem(CHAVE_MODO_NOTURNO) === '1';
  } catch (_) {
    altoContraste = false;
  }
  aplicarModoNoturno();
}

function toggleContraste() {
  altoContraste = !altoContraste;
  aplicarModoNoturno();
  try {
    localStorage.setItem(CHAVE_MODO_NOTURNO, altoContraste ? '1' : '0');
  } catch (_) { /* ignora */ }
  mostrarToast(altoContraste ? 'Modo noturno ativado 🌙' : 'Modo claro ativado ☀️');
}

function ouvirTexto(texto) {
  if (!('speechSynthesis' in window)) {
    mostrarToast('Navegador não suporta fala 😕');
    return;
  }
  window.speechSynthesis.cancel();
  if (ttsAtivo) {
    ttsAtivo = false;
    document.querySelectorAll('#btn-ouvir, #btn-ouvir-mg, #btn-ouvir-resumo').forEach(b => b.classList.remove('ativo'));
    return;
  }
  const textoLimpo = texto.replace(/<[^>]*>/g, '');
  ttsUtterance = new SpeechSynthesisUtterance(textoLimpo);
  ttsUtterance.lang = 'pt-BR';
  ttsUtterance.rate = 0.85;
  ttsUtterance.pitch = 1.1;
  ttsAtivo = true;
  document.querySelectorAll('#btn-ouvir, #btn-ouvir-mg, #btn-ouvir-resumo').forEach(b => b.classList.add('ativo'));
  ttsUtterance.onend = () => {
    ttsAtivo = false;
    document.querySelectorAll('#btn-ouvir, #btn-ouvir-mg, #btn-ouvir-resumo').forEach(b => b.classList.remove('ativo'));
  };
  window.speechSynthesis.speak(ttsUtterance);
}

function falarTexto(texto) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(texto.replace(/<[^>]*>/g,''));
  utt.lang = 'pt-BR';
  utt.rate = 0.85;
  utt.pitch = 1.1;
  window.speechSynthesis.speak(utt);
}

function mostrarToast(msg) {
  let cont = document.getElementById('toast-container');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'toast-container';
    cont.className = 'toast-container';
    document.body.appendChild(cont);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  cont.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
