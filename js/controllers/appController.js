/* =============================================
   MUNDO DAS HISTÓRIAS — appController.js (Controller)
   ============================================= */

'use strict';

const PAGINAS_POR_TELA = {
  biblioteca: 'index.html',
  leitura: 'index.html',
  minigame: 'index.html',
  resultado: 'index.html',
  'bot-ia': 'index.html',
  progresso: 'progresso.html',
  responsavel: 'responsavel.html'
};

function irParaTela(nomeTela) {
  const alvo = document.getElementById('tela-' + nomeTela);
  if (!alvo) {
    const pagina = PAGINAS_POR_TELA[nomeTela];
    if (pagina) window.location.href = pagina;
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

  if (nomeTela === 'progresso') atualizarTelaProgresso();
  if (nomeTela === 'responsavel') atualizarTelaProgresso();
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

  if (avatarDisp) avatarDisp.textContent = estado.perfil.avatar;
  if (headerNome) headerNome.textContent = estado.perfil.nome;
  if (headerNivel) headerNivel.textContent = labelNivel(estado.nivel);
  if (totalEstrelas) totalEstrelas.textContent = estado.totalEstrelas;
}

function refazerAtividade() {
  if (!estado.historiaAtual) {
    irParaTela('biblioteca');
    mostrarToast('Escolha uma história primeiro! 📚');
    return;
  }

  estado.acertos = 0;
  estado.ajudas = 0;
  estado.minigameAtual = 0;
  estado.mgAcertos = 0;
  estado.modoLeituraCompleta = false;
  estado.minigamesLista = [];
  estado.minigamesPreset = null;
  estado.iniciouEm = Date.now();

  irParaTela('leitura');
  mostrarLeituraCompleta();
}

function obterTelaInicialDaPagina() {
  if (document.getElementById('tela-progresso') && !document.getElementById('tela-biblioteca')) {
    return 'progresso';
  }
  if (document.getElementById('tela-responsavel') && !document.getElementById('tela-biblioteca')) {
    return 'responsavel';
  }
  return 'biblioteca';
}

function bindSeExistir(id, evento, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(evento, handler);
}

async function inicializar() {
  carregarEstado();
  if (estado.experiencia == null) estado.experiencia = 0;
  estado.nivel = calcularNivelPorXp(estado.experiencia);
  if (!estado.perfil || !estado.perfil.nome) {
    window.location.href = 'login.html';
    return;
  }

  await carregarProgressoDoServidor();
  await carregarHistoriasDaApi();
  aplicarFaixaDoPerfilNosFiltros();

  atualizarHeader();
  atualizarBarraExperiencia();
  renderizarBiblioteca();

  const telaInicial = obterTelaInicialDaPagina();
  irParaTela(telaInicial);

  inicializarFiltros();

  const btnGerar = document.getElementById('btn-gerar-historia');
  if (btnGerar) btnGerar.addEventListener('click', () => gerarHistoriaIa().catch(() => { }));
  const btnBotIaGerar = document.getElementById('btn-bot-ia-gerar');
  if (btnBotIaGerar) btnBotIaGerar.addEventListener('click', () => gerarHistoriaBotIa().catch(() => { }));
  inicializarGeneroBotIa();

  carregarModoNoturno();

  bindSeExistir('btn-contraste', 'click', toggleContraste);
  bindSeExistir('btn-fonte-mais', 'click', () => ajustarFonte(2));
  bindSeExistir('btn-fonte-menos', 'click', () => ajustarFonte(-2));

  bindSeExistir('btn-sair', 'click', () => {
    if (confirm('Deseja encerrar a sessão do responsável neste dispositivo?')) {
      localStorage.removeItem('mundoHistorias_responsavel_sessao');
      localStorage.removeItem('mundoHistorias_estado');
      window.location.href = 'login.html';
    }
  });

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

document.addEventListener('DOMContentLoaded', () => {
  inicializar();
});
