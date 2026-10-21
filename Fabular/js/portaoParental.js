/* =============================================
   Portão parental — conta matemática para configurações
   ============================================= */
'use strict';

const CHAVE_PORTAO_OK = 'portaoParentalOk';

function gerarContaParental() {
  const tipo = Math.floor(Math.random() * 3);
  let a;
  let b;
  let op;
  let res;
  if (tipo === 0) {
    a = Math.floor(Math.random() * 50) + 10;
    b = Math.floor(Math.random() * 50) + 10;
    op = '+';
    res = a + b;
  } else if (tipo === 1) {
    a = Math.floor(Math.random() * 50) + 30;
    b = Math.floor(Math.random() * 20) + 5;
    op = '−';
    res = a - b;
  } else {
    a = Math.floor(Math.random() * 10) + 3;
    b = Math.floor(Math.random() * 10) + 3;
    op = '×';
    res = a * b;
  }
  return { expr: `${a}  ${op}  ${b}  =  ?`, res };
}

function elementosPortaoParental() {
  return {
    overlay: document.getElementById('portao-parental-overlay'),
    contaEl: document.getElementById('portao-conta'),
    inputResp: document.getElementById('portao-resposta'),
    erroEl: document.getElementById('portao-erro'),
    btnConf: document.getElementById('portao-btn-confirmar'),
    btnCanc: document.getElementById('portao-btn-cancelar')
  };
}

function marcarPortaoParentalOk() {
  sessionStorage.setItem(CHAVE_PORTAO_OK, '1');
}

function consumirPortaoParentalOk() {
  if (sessionStorage.getItem(CHAVE_PORTAO_OK) !== '1') return false;
  sessionStorage.removeItem(CHAVE_PORTAO_OK);
  return true;
}

function abrirPortaoParental() {
  const els = elementosPortaoParental();
  if (!els.overlay) return false;
  const { expr, res } = gerarContaParental();
  els.overlay.dataset.resposta = String(res);
  if (els.contaEl) els.contaEl.textContent = expr;
  if (els.inputResp) els.inputResp.value = '';
  if (els.erroEl) els.erroEl.classList.add('oculto');
  els.overlay.classList.remove('oculto');
  els.overlay.removeAttribute('hidden');
  setTimeout(() => els.inputResp && els.inputResp.focus(), 80);
  return true;
}

function fecharPortaoParental() {
  const { overlay } = elementosPortaoParental();
  if (!overlay) return;
  overlay.classList.add('oculto');
  overlay.setAttribute('hidden', '');
}

function confirmarPortaoParental(onSuccess) {
  const els = elementosPortaoParental();
  const val = parseInt(els.inputResp && els.inputResp.value, 10);
  const correta = parseInt(els.overlay && els.overlay.dataset.resposta, 10);
  if (val === correta) {
    fecharPortaoParental();
    if (typeof onSuccess === 'function') onSuccess();
    return;
  }
  if (els.erroEl) {
    els.erroEl.classList.remove('oculto');
    els.erroEl.style.animation = 'none';
    void els.erroEl.offsetWidth;
    els.erroEl.style.animation = '';
  }
  if (els.inputResp) {
    els.inputResp.value = '';
    els.inputResp.focus();
  }
  const { expr, res } = gerarContaParental();
  if (els.overlay) els.overlay.dataset.resposta = String(res);
  if (els.contaEl) els.contaEl.textContent = expr;
}

function configurarPortaoParental(opcoes) {
  const onSuccess = typeof opcoes === 'function' ? opcoes : opcoes && opcoes.onSuccess;
  const onCancel = typeof opcoes === 'object' && opcoes ? opcoes.onCancel : null;
  const els = elementosPortaoParental();
  if (!els.overlay) return;

  if (els.btnConf) {
    els.btnConf.onclick = () => confirmarPortaoParental(onSuccess);
  }
  if (els.inputResp) {
    els.inputResp.onkeydown = (e) => {
      if (e.key === 'Enter') confirmarPortaoParental(onSuccess);
    };
  }
  if (els.btnCanc) {
    els.btnCanc.onclick = () => {
      fecharPortaoParental();
      if (typeof onCancel === 'function') onCancel();
    };
  }
  els.overlay.addEventListener('click', (e) => {
    if (e.target !== els.overlay) return;
    fecharPortaoParental();
    if (typeof onCancel === 'function') onCancel();
  });
}
