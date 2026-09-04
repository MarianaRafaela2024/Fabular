/* =============================================
   MUNDO DAS HISTÓRIAS — appController.js (Controller)
   ============================================= */

'use strict';

const PAGINAS_POR_TELA = {
  biblioteca: 'index.html',
  leitura: 'index.html',
  minigame: 'index.html',
  resultado: 'index.html',
  'bot-ia': 'bot.html',
  progresso: 'progresso.html'
};

function irParaTela(nomeTela) {
  const alvo = document.getElementById('tela-' + nomeTela);
  if (!alvo) {
    const pagina = PAGINAS_POR_TELA[nomeTela];
    if (pagina) {
      sessionStorage.setItem('telaDesejada', nomeTela);
      if (typeof escurecerParaTransicao === 'function') escurecerParaTransicao();
      window.location.href = pagina;
    }
    return;
  }

  document.querySelectorAll('.tela-app').forEach(t => t.classList.remove('ativa'));
  alvo.classList.add('ativa');

  document.querySelectorAll('.nav-item').forEach(b => {
    const ativo = b.dataset.tela === nomeTela;
    b.classList.toggle('ativo', ativo);
    b.setAttribute('aria-current', ativo ? 'page' : 'false');
  });

  const main = document.getElementById('app-main');
  if (main) main.scrollTop = 0;

  if (nomeTela === 'progresso') {
    carregarProgressoDoServidor()
      .then(() => atualizarTelaProgresso())
      .catch(() => atualizarTelaProgresso());
  }
  if (nomeTela === 'biblioteca') {
    carregarProgressoDoServidor()
      .then(() => carregarHistoriasDaApi())
      .then(() => renderizarBiblioteca())
      .catch(() => renderizarBiblioteca());
  }
}

function atualizarHeader() {
  const avatarDisp = document.getElementById('avatar-display');
  const headerNome = document.getElementById('header-nome');
  const headerNivel = document.getElementById('header-nivel');
  const totalEstrelas = document.getElementById('total-estrelas');

  if (avatarDisp) {
    if (typeof renderizarElementoAvatar === 'function') {
      renderizarElementoAvatar(avatarDisp, estado.perfil.avatar || 'midia/lion.png', 'header-avatar-img');
    } else {
      avatarDisp.textContent = estado.perfil.avatar || '🦁';
    }
  }
  if (headerNome) headerNome.textContent = estado.perfil.nome;
  if (headerNivel) headerNivel.textContent = labelNivel(estado.nivel);
  if (totalEstrelas) totalEstrelas.textContent = estado.totalEstrelas;
  if (typeof renderizarHeaderVidas === 'function') renderizarHeaderVidas();
}

function refazerAtividade() {
  if (typeof verificarPodeJogarMinigame === 'function' && !verificarPodeJogarMinigame()) {
    if (typeof mostrarModalVidasEsgotadas === 'function') mostrarModalVidasEsgotadas();
    return;
  }

  if (!estado.historiaAtual) {
    irParaTela('biblioteca');
    mostrarToast('Escolha uma história primeiro! 📚');
    return;
  }

  estado.acertos = 0;
  estado.ajudas = 0;
  estado.minigameAtual = 0;
  estado.mgAcertos = 0;
  estado.iniciouEm = Date.now();
  prepararMinigamesPreset(estado.historiaAtual);

  irParaTela('leitura');
  mostrarLeituraCompleta();
}

function obterTelaInicialDaPagina() {
  const telaSalva = sessionStorage.getItem('telaDesejada');
  if (telaSalva) {
    sessionStorage.removeItem('telaDesejada');
    if (document.getElementById('tela-' + telaSalva)) {
      return telaSalva;
    }
  }
  if (document.getElementById('tela-progresso') && !document.getElementById('tela-biblioteca')) {
    return 'progresso';
  }

  if (document.getElementById('tela-bot-ia') && !document.getElementById('tela-biblioteca')) {
    return 'bot-ia';
  }
  return 'biblioteca';
}

function bindSeExistir(id, evento, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(evento, handler);
}

async function inicializar() {
  carregarEstado();
  estado.nivel = calcularNivelPorXp(estado.totalEstrelas);
  if (!estado.perfil || !estado.perfil.nome) {
    window.location.href = 'login.html';
    return;
  }

  try {
    await carregarProgressoDoServidor();
  } catch (_) { }
  estado.syncPermitido = true;

  try {
    await carregarHistoriasDaApi();
  } catch (_) { }
  aplicarFaixaDoPerfilNosFiltros();

  atualizarHeader();
  atualizarBarraExperiencia();
  renderizarBiblioteca();

  const telaInicial = obterTelaInicialDaPagina();
  irParaTela(telaInicial);

  if (telaInicial === 'leitura') {
    const idDesejado = sessionStorage.getItem('historiaIdDesejada');
    if (idDesejado) {
      sessionStorage.removeItem('historiaIdDesejada');
      await iniciarHistoria(idDesejado, { irLeitura: true });
    } else if (estado.historiaAtual) {
      mostrarLeituraCompleta();
    }
  }

  inicializarFiltros();

  const btnGerar = document.getElementById('btn-gerar-historia');
  if (btnGerar) btnGerar.addEventListener('click', () => gerarHistoriaIa().catch(() => { }));
  const btnBotIaGerar = document.getElementById('btn-bot-ia-gerar');
  if (btnBotIaGerar) btnBotIaGerar.addEventListener('click', () => gerarHistoriaBotIa().catch(() => { }));
  inicializarGeneroBotIa();

  carregarModoNoturno();
  carregarTamanhoFonte();

  bindSeExistir('btn-contraste', 'click', toggleContraste);
  bindSeExistir('btn-fonte-mais', 'click', () => ajustarFonte(2));
  bindSeExistir('btn-fonte-menos', 'click', () => ajustarFonte(-2));

  bindSeExistir('btn-sair', 'click', mostrarModalSair);

  // ── Menu de 3 pontinhos do header ──────────────────────────────────────────
  const btnMais = document.getElementById('btn-header-mais');
  const menuMais = document.getElementById('header-mais-menu');

  if (btnMais && menuMais) {
    btnMais.addEventListener('click', (e) => {
      e.stopPropagation();
      const aberto = menuMais.classList.toggle('aberto');
      btnMais.setAttribute('aria-expanded', String(aberto));
      menuMais.setAttribute('aria-hidden', String(!aberto));
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
      if (!menuMais.contains(e.target) && e.target !== btnMais) {
        menuMais.classList.remove('aberto');
        btnMais.setAttribute('aria-expanded', 'false');
        menuMais.setAttribute('aria-hidden', 'true');
      }
    });

    // Fecha ao acionar botões internos — EXCETO os de fonte (mantêm menu aberto)
    const IDS_NAO_FECHAM = new Set(['btn-fonte-mais', 'btn-fonte-menos']);
    menuMais.querySelectorAll('button').forEach(btn => {
      if (IDS_NAO_FECHAM.has(btn.id)) return; // fonte: não fecha
      btn.addEventListener('click', () => {
        setTimeout(() => {
          menuMais.classList.remove('aberto');
          btnMais.setAttribute('aria-expanded', 'false');
          menuMais.setAttribute('aria-hidden', 'true');
        }, 120);
      });
    });
  }

  // ───────────────────────────────────────────────────────────────────────────

  // ── Portão Parental → Configurações ────────────────────────────────────────
  const overlay   = document.getElementById('portao-parental-overlay');
  const contaEl   = document.getElementById('portao-conta');
  const inputResp = document.getElementById('portao-resposta');
  const erroEl    = document.getElementById('portao-erro');
  const btnConf   = document.getElementById('portao-btn-confirmar');
  const btnCanc   = document.getElementById('portao-btn-cancelar');
  const btnConfig = document.getElementById('btn-ir-configuracoes');

  let _respostaCorreta = 0;

  function _gerarContaParental() {
    const tipo = Math.floor(Math.random() * 3); // 0=soma, 1=sub, 2=mult
    let a, b, op, res;
    if (tipo === 0) {
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 50) + 10;
      op = '+'; res = a + b;
    } else if (tipo === 1) {
      a = Math.floor(Math.random() * 50) + 30;
      b = Math.floor(Math.random() * 20) + 5;
      op = '−'; res = a - b;
    } else {
      a = Math.floor(Math.random() * 10) + 3;
      b = Math.floor(Math.random() * 10) + 3;
      op = '×'; res = a * b;
    }
    return { expr: `${a}  ${op}  ${b}  =  ?`, res };
  }

  function _abrirPortaoParental() {
    if (!overlay) return;
    const { expr, res } = _gerarContaParental();
    _respostaCorreta = res;
    if (contaEl) contaEl.textContent = expr;
    if (inputResp) inputResp.value = '';
    if (erroEl)   erroEl.classList.add('oculto');
    overlay.classList.remove('oculto');
    setTimeout(() => inputResp && inputResp.focus(), 80);
  }

  function _fecharPortaoParental() {
    if (overlay) overlay.classList.add('oculto');
  }

  function _confirmarPortao() {
    const val = parseInt(inputResp && inputResp.value, 10);
    if (val === _respostaCorreta) {
      _fecharPortaoParental();
      sessionStorage.setItem('configVoltarBiblioteca', '1');
      window.location.href = 'configuracoes.html';
    } else {
      if (erroEl) {
        erroEl.classList.remove('oculto');
        // Reinicia animação de shake
        erroEl.style.animation = 'none';
        void erroEl.offsetWidth;
        erroEl.style.animation = '';
      }
      if (inputResp) { inputResp.value = ''; inputResp.focus(); }
      const { expr, res } = _gerarContaParental();
      _respostaCorreta = res;
      if (contaEl) contaEl.textContent = expr;
    }
  }

  if (btnConfig) {
    btnConfig.addEventListener('click', _abrirPortaoParental);
  }
  if (btnConf) {
    btnConf.addEventListener('click', _confirmarPortao);
  }
  if (inputResp) {
    inputResp.addEventListener('keydown', (e) => { if (e.key === 'Enter') _confirmarPortao(); });
  }
  if (btnCanc) {
    btnCanc.addEventListener('click', _fecharPortaoParental);
  }
  // Fecha ao clicar no overlay fora do card
  if (overlay) {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) _fecharPortaoParental(); });
  }
  // ───────────────────────────────────────────────────────────────────────────

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tela = btn.dataset.tela;
      if (tela === 'leitura' && !estado.historiaAtual) {
        mostrarToast('Escolha uma história primeiro! 📚');
        return;
      }
      irParaTela(tela);
    });
  });

  bindSeExistir('btn-ouvir', 'click', () => {
    const h = estado.historiaAtual;
    if (!h) {
      mostrarToast('Escolha uma história primeiro! 📚');
      return;
    }
    if (ttsAtivo) {
      window.speechSynthesis.cancel();
      ttsAtivo = false;
      const btnOuvir = document.getElementById('btn-ouvir');
      if (btnOuvir) btnOuvir.classList.remove('ativo');
      return;
    }
    const texto = estado.modoLeituraCompleta
      ? obterTextoCompletoHistoria(h)
      : (document.getElementById('historia-texto')?.innerHTML || '');

    ouvirTexto(texto);
  });

  bindSeExistir('btn-destaque', 'click', () => {
    estado.destaqueAtivo = !estado.destaqueAtivo;
    const btnDestaque = document.getElementById('btn-destaque');
    const historiaTexto = document.getElementById('historia-texto');
    if (btnDestaque) btnDestaque.classList.toggle('ativo', estado.destaqueAtivo);
    if (historiaTexto) historiaTexto.classList.toggle('sem-destaque', !estado.destaqueAtivo);
    mostrarToast(estado.destaqueAtivo ? 'Palavras-chave destacadas! 🔍' : 'Destaque removido');
  });

  bindSeExistir('btn-continuar', 'click', () => {
    const btn = document.getElementById('btn-continuar');
    const textoBtn = (btn?.textContent || '').toLowerCase();
    const deveIniciarMinigames = estado.modoLeituraCompleta || textoBtn.includes('vamos jogar') || textoBtn.includes('minigame');

    if (deveIniciarMinigames) {
      estado.modoLeituraCompleta = true;
      iniciarSequenciaMinigames();
    } else {
      avancarFase();
    }
  });

  bindSeExistir('btn-pular-fase', 'click', pularFase);
  bindSeExistir('btn-voltar-biblioteca', 'click', () => irParaTela('biblioteca'));

  bindSeExistir('btn-pagina-anterior', 'click', () => {
    if (typeof virarPaginaAnterior === 'function') virarPaginaAnterior();
  });
  bindSeExistir('btn-proxima-pagina', 'click', () => {
    if (typeof virarProximaPagina === 'function') virarProximaPagina();
  });

  window.addEventListener('keydown', (e) => {
    const telaLeitura = document.getElementById('tela-leitura');
    if (telaLeitura && telaLeitura.classList.contains('ativa')) {
      if (e.key === 'ArrowLeft') {
        if (typeof virarPaginaAnterior === 'function') virarPaginaAnterior();
      } else if (e.key === 'ArrowRight') {
        if (typeof virarProximaPagina === 'function') virarProximaPagina();
      }
    }
  });

  bindSeExistir('btn-proximo-mg', 'click', proximoMinigame);
  bindSeExistir('btn-finalizar-mg', 'click', finalizarMinigames);
  bindSeExistir('btn-voltar-leitura', 'click', () => {
    if (estado.modoLeituraCompleta) mostrarLeituraCompleta();
    else { irParaTela('leitura'); mostrarLeituraCompleta(); }
  });

  bindSeExistir('btn-ouvir-mg', 'click', () => {
    const enunc = document.querySelector('#minigame-corpo .mg-enunciado');
    if (enunc) ouvirTexto(enunc.textContent);
  });

  bindSeExistir('btn-refazer-atividade', 'click', refazerAtividade);
  bindSeExistir('btn-jogar-novamente', 'click', () => irParaTela('biblioteca'));
  bindSeExistir('btn-ver-progresso', 'click', () => irParaTela('progresso'));
}

function mostrarModalSair() {
  let modal = document.getElementById('modal-sair-container');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-sair-container';
    modal.className = 'modal-sair-overlay';
    modal.innerHTML = `
      <div class="modal-sair-card" role="dialog" aria-modal="true" aria-labelledby="modal-sair-titulo">
        <button class="modal-sair-fechar" id="btn-modal-sair-fechar" aria-label="Fechar modal">&times;</button>
        <div class="modal-sair-header">
          <h2 id="modal-sair-titulo" class="modal-sair-titulo">Como você deseja sair?</h2>
        </div>
        <div class="modal-sair-opcoes">
          <button class="modal-op-btn modal-op-perfil" id="btn-modal-trocar-perfil" type="button">
            <div class="modal-op-info">
              <strong>Trocar de Perfil</strong>
            </div>
          </button>
          <button class="modal-op-btn modal-op-logout" id="btn-modal-logout-geral" type="button">
            <div class="modal-op-info">
              <strong>Sair</strong>
            </div>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const fechar = () => {
      modal.classList.remove('ativo');
    };

    document.getElementById('btn-modal-sair-fechar').addEventListener('click', fechar);
   

    modal.addEventListener('click', (e) => {
      if (e.target === modal) fechar();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('ativo')) {
        fechar();
      }
    });

    document.getElementById('btn-modal-trocar-perfil').addEventListener('click', () => {
      fechar();
      if (typeof salvarEstado === 'function') salvarEstado();
      if (typeof resetarTamanhoFonte === 'function') resetarTamanhoFonte();
      else localStorage.removeItem('mundoHistorias_tamanhoFonte');
      window.location.href = 'login.html';
    });

    document.getElementById('btn-modal-logout-geral').addEventListener('click', () => {
      fechar();
      if (typeof resetarTamanhoFonte === 'function') resetarTamanhoFonte();
      else localStorage.removeItem('mundoHistorias_tamanhoFonte');
      localStorage.removeItem('mundoHistorias_responsavel_sessao');
      localStorage.removeItem('mundoHistorias_estado');
      window.location.href = 'login.html';
    });
  }

  modal.classList.add('ativo');
}

document.addEventListener('DOMContentLoaded', () => {
  inicializar();
});

