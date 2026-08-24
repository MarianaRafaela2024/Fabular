/* =============================================
   MUNDO DAS HISTÓRIAS — accessibilityView.js (View)
   ============================================= */

'use strict';

let tamanhoFonte = 16;
let altoContraste = false;
const CHAVE_MODO_NOTURNO = 'mundoHistorias_modoNoturno';
const CHAVE_TAMANHO_FONTE = 'mundoHistorias_tamanhoFonte';

let ttsAtivo = false;
let ttsUtterance = null;

function carregarTamanhoFonte() {
  try {
    const f = localStorage.getItem(CHAVE_TAMANHO_FONTE);
    if (f) {
      tamanhoFonte = parseInt(f, 10) || 16;
    } else {
      tamanhoFonte = 16;
    }
  } catch (_) {
    tamanhoFonte = 16;
  }
  aplicarTamanhoFonte();
}

function aplicarTamanhoFonte() {
  document.documentElement.style.fontSize = tamanhoFonte + 'px';
  document.documentElement.style.setProperty('--fonte-base', tamanhoFonte + 'px');
}

function ajustarFonte(delta) {
  tamanhoFonte = Math.min(26, Math.max(12, tamanhoFonte + delta));
  aplicarTamanhoFonte();
  try {
    localStorage.setItem(CHAVE_TAMANHO_FONTE, String(tamanhoFonte));
  } catch (_) {}
}

function resetarTamanhoFonte() {
  tamanhoFonte = 16;
  aplicarTamanhoFonte();
  try {
    localStorage.removeItem(CHAVE_TAMANHO_FONTE);
  } catch (_) {}
}

function aplicarModoNoturno() {
  document.documentElement.classList.toggle('alto-contraste', altoContraste);
  if (altoContraste) {
    document.documentElement.style.backgroundColor = '#0D1117';
  } else {
    document.documentElement.style.backgroundColor = '';
  }
  if (document.body) {
    document.body.classList.toggle('alto-contraste', altoContraste);
    if (altoContraste) {
      document.body.style.backgroundColor = '#0D1117';
    } else {
      document.body.style.backgroundColor = '';
    }
  }
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

function escurecerParaTransicao() {
  try {
    if (localStorage.getItem(CHAVE_MODO_NOTURNO) === '1') {
      document.documentElement.classList.add('alto-contraste');
      document.documentElement.style.backgroundColor = '#0D1117';
      if (document.body) {
        document.body.classList.add('alto-contraste');
        document.body.style.backgroundColor = '#0D1117';
      }
      let overlay = document.getElementById('page-transition-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'page-transition-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:#0D1117;z-index:999999;pointer-events:none;';
        (document.body || document.documentElement).appendChild(overlay);
      } else {
        overlay.style.display = 'block';
      }
    }
  } catch (_) {}
}

window.addEventListener('beforeunload', escurecerParaTransicao);
window.addEventListener('pagehide', escurecerParaTransicao);

document.addEventListener('click', (e) => {
  const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
  if (a && a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {
    escurecerParaTransicao();
  }
}, true);

// Inicializa configurações de acessibilidade imediatamente ao carregar o script
carregarModoNoturno();
carregarTamanhoFonte();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    aplicarModoNoturno();
    aplicarTamanhoFonte();
  });
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
