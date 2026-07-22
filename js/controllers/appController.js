/* =============================================
   MUNDO DAS HISTÓRIAS — appController.js (Controller)
   ============================================= */

'use strict';

function irParaTela(nomeTela) {
  document.querySelectorAll('.tela-app').forEach(t => t.classList.remove('ativa'));
  const alvo = document.getElementById('tela-' + nomeTela);
  if (alvo) alvo.classList.add('ativa');

  document.querySelectorAll('.nav-item').forEach(b => {
    const ativo = b.dataset.tela === nomeTela;
    b.classList.toggle('ativo', ativo);
    b.setAttribute('aria-current', ativo ? 'page' : 'false');
  });

  const main = document.getElementById('app-main');
  if (main) main.scrollTop = 0;

  if (nomeTela === 'progresso') atualizarTelaProgresso();
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
  irParaTela('biblioteca');

  inicializarFiltros();

  const btnGerar = document.getElementById('btn-gerar-historia');
  if (btnGerar) btnGerar.addEventListener('click', () => gerarHistoriaIa().catch(() => {}));
  const btnBotIaGerar = document.getElementById('btn-bot-ia-gerar');
  if (btnBotIaGerar) btnBotIaGerar.addEventListener('click', () => gerarHistoriaBotIa().catch(() => {}));
  inicializarGeneroBotIa();

  carregarModoNoturno();

  document.getElementById('btn-contraste').addEventListener('click', toggleContraste);
  document.getElementById('btn-fonte-mais').addEventListener('click', () => ajustarFonte(2));
  document.getElementById('btn-fonte-menos').addEventListener('click', () => ajustarFonte(-2));

  document.getElementById('btn-sair').addEventListener('click', () => {
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

  document.getElementById('btn-ouvir').addEventListener('click', () => {
    const h = estado.historiaAtual;
    if (!h) {
      mostrarToast('Escolha uma história primeiro! 📚');
      return;
    }
    if (ttsAtivo) {
      window.speechSynthesis.cancel();
      ttsAtivo = false;
      document.getElementById('btn-ouvir').classList.remove('ativo');
      return;
    }
    const texto = estado.modoLeituraCompleta
      ? obterTextoCompletoHistoria(h)
      : document.getElementById('historia-texto').innerHTML;

    ouvirTexto(texto);
  });
  
  document.getElementById('btn-destaque').addEventListener('click', () => {
    estado.destaqueAtivo = !estado.destaqueAtivo;
    document.getElementById('btn-destaque').classList.toggle('ativo', estado.destaqueAtivo);
    document.getElementById('historia-texto').classList.toggle('sem-destaque', !estado.destaqueAtivo);
    mostrarToast(estado.destaqueAtivo ? 'Palavras-chave destacadas! 🔍' : 'Destaque removido');
  });
  
  document.getElementById('btn-continuar').addEventListener('click', () => {
    if (estado.modoLeituraCompleta) iniciarSequenciaMinigames();
    else avancarFase();
  });
  
  document.getElementById('btn-pular-fase').addEventListener('click', pularFase);
  document.getElementById('btn-voltar-biblioteca').addEventListener('click', () => irParaTela('biblioteca'));

  document.getElementById('btn-proximo-mg').addEventListener('click', proximoMinigame);
  document.getElementById('btn-finalizar-mg').addEventListener('click', finalizarMinigames);
  document.getElementById('btn-voltar-leitura').addEventListener('click', () => {
    if (estado.modoLeituraCompleta) mostrarLeituraCompleta();
    else { irParaTela('leitura'); renderizarFase(); }
  });
  
  document.getElementById('btn-ouvir-mg').addEventListener('click', () => {
    const enunc = document.querySelector('#minigame-corpo .mg-enunciado');
    if (enunc) ouvirTexto(enunc.textContent);
  });

  document.getElementById('btn-refazer-atividade').addEventListener('click', refazerAtividade);
  document.getElementById('btn-jogar-novamente').addEventListener('click', () => irParaTela('biblioteca'));
  document.getElementById('btn-ver-progresso').addEventListener('click', () => irParaTela('progresso'));
}

document.addEventListener('DOMContentLoaded', () => {
  inicializar();
});

