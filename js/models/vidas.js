/* =============================================
   MUNDO DAS HISTÓRIAS — vidas.js (Model/Controller de Vidas Globais)
   ============================================= */

'use strict';

const MAX_VIDAS = 5;
const TEMPO_REGENERACAO_MS = 10 * 60 * 1000; // 10 minutos em ms

/**
 * Retorna a chave única do perfil da criança atualmente ativa.
 */
function obterChaveCriancaAtual() {
  if (!estado || !estado.perfil) return 'padrao';
  const id = estado.perfil.id || estado.perfil.Id;
  if (id != null && id !== '') return `id_${id}`;
  const nome = (estado.perfil.nome || '').trim().toLowerCase();
  if (nome) return `nome_${nome}`;
  return 'padrao';
}

/**
 * Obtém o histórico de timestamps de vidas perdidas ainda ativas (menos de 10 minutos atrás)
 * para o perfil infantil ativo.
 */
function obterHistoricoVidasPerdidas() {
  if (!estado) return [];
  if (!estado.vidasPerdidasPorCrianca || typeof estado.vidasPerdidasPorCrianca !== 'object') {
    estado.vidasPerdidasPorCrianca = {};
  }

  const chave = obterChaveCriancaAtual();

  // Tenta resgatar histórico da chave persistente dedicada se a chave da criança não estiver presente no estado
  if (!estado.vidasPerdidasPorCrianca[chave]) {
    try {
      const rawVidas = localStorage.getItem('mundoHistorias_vidas_criancas');
      if (rawVidas) {
        const parsed = JSON.parse(rawVidas);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed[chave])) {
          estado.vidasPerdidasPorCrianca[chave] = [...parsed[chave]];
        }
      }
    } catch (_) { }
  }

  // Migra histórico de vidas do formato legado se houver
  if (Array.isArray(estado.vidasPerdidas) && estado.vidasPerdidas.length > 0) {
    if (!estado.vidasPerdidasPorCrianca[chave]) {
      estado.vidasPerdidasPorCrianca[chave] = [...estado.vidasPerdidas];
    }
    estado.vidasPerdidas = [];
  }

  const perdasCrianca = Array.isArray(estado.vidasPerdidasPorCrianca[chave])
    ? estado.vidasPerdidasPorCrianca[chave]
    : [];

  const agora = Date.now();
  const perdasValidas = perdasCrianca.filter(
    (t) => typeof t === 'number' && agora - t < TEMPO_REGENERACAO_MS
  );

  // Se limpou timestamps expirados, salva o estado atualizado
  if (perdasValidas.length !== perdasCrianca.length) {
    estado.vidasPerdidasPorCrianca[chave] = perdasValidas;
    if (typeof salvarEstado === 'function') salvarEstado();
  }

  return perdasValidas;
}

//Retorna a quantidade de vidas globais atuais (entre 0 e MAX_VIDAS).
function obterVidasAtuais() {
  const perdas = obterHistoricoVidasPerdidas();
  const vidas = MAX_VIDAS - perdas.length;
  return Math.max(0, Math.min(MAX_VIDAS, vidas));
}

//Retorna o tempo restante em ms para a recuperação do próximo coração.
//Se estiver com vidas cheias, retorna 0.
function obterTempoProximoCoracao() {
  const perdas = obterHistoricoVidasPerdidas();
  if (!perdas.length) return 0;

  const maisAntiga = Math.min(...perdas);
  const decorrido = Date.now() - maisAntiga;
  const restante = TEMPO_REGENERACAO_MS - decorrido;
  return Math.max(0, restante);
}

//Formata um valor em ms para MM:SS.
function formatarTempoRegeneracao(ms) {
  if (ms <= 0) return '00:00';
  const totalSegundos = Math.ceil(ms / 1000);
  const min = Math.floor(totalSegundos / 60);
  const seg = totalSegundos % 60;
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

//Registra a perda de 1 coração para a criança ativa.
//Retorna objeto com { vidasRestantes, zerou }.
function perderVida() {
  if (!estado) return { vidasRestantes: MAX_VIDAS, zerou: false };
  if (!estado.vidasPerdidasPorCrianca || typeof estado.vidasPerdidasPorCrianca !== 'object') {
    estado.vidasPerdidasPorCrianca = {};
  }

  const chave = obterChaveCriancaAtual();
  const perdas = obterHistoricoVidasPerdidas();

  if (perdas.length < MAX_VIDAS) {
    perdas.push(Date.now());
    estado.vidasPerdidasPorCrianca[chave] = perdas;
    if (typeof salvarEstado === 'function') salvarEstado();
  }

  const vidasRestantes = obterVidasAtuais();
  const zerou = vidasRestantes === 0;

  renderizarHeaderVidas(true);

  return { vidasRestantes, zerou };
}

//Verifica se a criança possui mais de 0 vidas no sistema.
function verificarPodeJogarMinigame() {
  return obterVidasAtuais() > 0;
}

//Atualiza o contador de vidas exibido no header da aplicação.
//animarPerda - Se deve aplicar animação de perda
function renderizarHeaderVidas(animarPerda = false) {
  const vidas = obterVidasAtuais();
  const badge = document.getElementById('badge-vidas');
  const elTotal = document.getElementById('total-vidas');
  const elIcone = document.getElementById('icone-vidas-header');

  const restanteMs = obterTempoProximoCoracao();
  const tempoFaltaStr = formatarTempoRegeneracao(restanteMs);

  if (vidas === 0) {
    if (elTotal) {
      elTotal.textContent = tempoFaltaStr;
    }
    if (elIcone) {
      elIcone.textContent = '⏳';
    }
    if (badge) {
      badge.setAttribute('title', `Vidas esgotadas — Próximo coração em ${tempoFaltaStr}`);
      badge.classList.add('vidas-zeradas');
    }
  } else {
    if (elTotal) {
      elTotal.textContent = `${vidas}/${MAX_VIDAS}`;
    }
    if (elIcone) {
      elIcone.textContent = '❤️';
    }
    if (badge) {
      badge.classList.remove('vidas-zeradas');
      if (vidas < MAX_VIDAS && restanteMs > 0) {
        badge.setAttribute('title', `Vidas: ${vidas}/${MAX_VIDAS} — Próximo coração em ${tempoFaltaStr}`);
      } else {
        badge.setAttribute('title', `Vidas: ${vidas}/${MAX_VIDAS} (Energia total!)`);
      }
    }
  }

  if (badge && animarPerda) {
    badge.classList.remove('perdeu-vida-anim');
    void badge.offsetWidth;
    badge.classList.add('perdeu-vida-anim');
  }
}

/**
 * Exibe um toast/notificação breve e amigável informando a perda de um coração.
 */
function mostrarAvisoPerdaVida(vidasRestantes) {
  let toast = document.getElementById('toast-perda-vida');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-perda-vida';
    toast.className = 'toast-perda-vida-container';
    document.body.appendChild(toast);
  }

  const msgCoracao = vidasRestantes === 1 ? 'Resta 1 coração! ❤️' : `Restam ${vidasRestantes} corações! ❤️`;

  toast.innerHTML = `
    <div class="toast-perda-conteudo">
      <span class="toast-perda-icone">💔</span>
      <div class="toast-perda-texto">
        <strong>Ops! Você perdeu 1 coração</strong>
        <span>${msgCoracao} Concentre-se e tente o seu melhor! ✨</span>
      </div>
    </div>
  `;

  toast.classList.add('visivel');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('visivel');
  }, 4000);
}

/**
 * Exibe o modal de vidas esgotadas (0 corações).
 */
function mostrarModalVidasEsgotadas() {
  let modal = document.getElementById('modal-vidas-esgotadas');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-vidas-esgotadas';
    modal.className = 'modal-overlay-vidas';
    document.body.appendChild(modal);
  }

  const restanteMs = obterTempoProximoCoracao();
  const tempoStr = formatarTempoRegeneracao(restanteMs);

  modal.innerHTML = `
    <div class="modal-card-vidas">
      <div class="modal-vidas-header">
        <span class="modal-vidas-emoji">💔</span>
        <h2>Suas Vidas Acabaram!</h2>
      </div>
      <div class="modal-vidas-corpo">
        <p>Você errou alguns desafios, mas não se preocupe! Todo grande aventureiro precisa descansar um pouco.</p>
        <p>Recarregue suas energias e continue lendo histórias! Você poderá jogar os minigames novamente assim que seus corações retornarem.</p>

        <div class="modal-vidas-timer-box">
          <span class="modal-vidas-timer-label">⏰ Próximo coração em:</span>
          <span class="modal-vidas-timer-valor" id="vidas-timer-modal">${tempoStr}</span>
        </div>
      </div>
      <div class="modal-vidas-acoes">
        <button class="btn-principal" id="btn-fechar-modal-vidas">Voltar para as Histórias 📚</button>
      </div>
    </div>
  `;

  modal.classList.add('visivel');

  const btnFechar = document.getElementById('btn-fechar-modal-vidas');
  if (btnFechar) {
    btnFechar.addEventListener('click', () => {
      modal.classList.remove('visivel');
      if (typeof irParaTela === 'function') {
        irParaTela('biblioteca');
      }
    });
  }
}

/**
 * Loop contínuo a cada segundo para atualizar temporizadores de vida e o modal ativo.
 */
setInterval(() => {
  if (typeof estado === 'undefined' || !estado) return;

  renderizarHeaderVidas(false);

  const modal = document.getElementById('modal-vidas-esgotadas');
  if (modal && modal.classList.contains('visivel')) {
    const timerVal = document.getElementById('vidas-timer-modal');
    const restanteMs = obterTempoProximoCoracao();
    if (timerVal) {
      timerVal.textContent = formatarTempoRegeneracao(restanteMs);
    }
    // Se regenerou alguma vida enquanto o modal estava aberto, podemos permitir que o usuário continue
    if (obterVidasAtuais() > 0) {
      modal.classList.remove('visivel');
      if (typeof mostrarToast === 'function') {
        mostrarToast('Seus corações recarregaram! Você já pode jogar novamente! ❤️✨');
      }
    }
  }
}, 1000);
