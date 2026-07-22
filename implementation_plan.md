# Reorganization of Frontend to MVC and Clean Code

The goal of this task is to refactor and organize the frontend codebase of Fabular. Currently, all core application logic resides in a single, massive file: `app.js` (over 4400 lines of code). This file contains data mockups, state tracking, API calls, rendering engines for 11 different minigames, and routing/initialization code. 

By reorganizing this code into a clean, modular MVC (Model-View-Controller) structure, we will significantly improve its readability, maintainability, and ease of expansion.

## User Review Required

> [!IMPORTANT]
> To ensure compatibility with standard browser execution (opening `index.html` directly via the `file://` protocol or serving it locally with simple static servers), we will use standard script loading in `index.html`. This avoids CORS restrictions that occur when loading ES6 modules (`import`/`export`) from local files, guaranteeing that the application remains fully functional in all test environments.

## Open Questions

There are no major open questions. We will preserve the exact functional behavior and styling of the application, only reorganizing the code structure.

---

## Proposed Changes

We will create a clean `js/` folder structure to contain the split files, group them by their MVC concern, and update the HTML scripts.

### 1. Model Layer
The Model layer manages stories data, game states, API calls, and local storage.

#### [NEW] [stories.js](file:///e:/Fabular-main/js/models/stories.js)
Stores stories data templates, minigame databases, Groq system prompts, and story-related API/cache functions.
- Globals: `HISTORIAS`, `MINIGAMES_BANCO`, `MSGS_ACERTO`, `MSGS_ERRO`, `MSGS_RESULTADO`.
- Functions: `carregarHistoriasDaApi`, `carregarDetalheHistoriaDaApi`, `salvarHistoriaNoCache`, `carregarCacheHistorias`, `mesclarHistoriasCache`, `garantirHistoriaNaBiblioteca`, `preservarDetalheHistoriaNaBiblioteca`, `escolherMinigamesTipos`, `normalizarMinigamePreset`, `normalizarStoryGroq`, `enriquecerParesMemoria`, `emojiParaPalavra`, `faixaParaIdade`, `normalizarTipoMinigame`, `chaveUnicaMinigame`, `montarListaMinigamesUnica`, `extrairPalavrasLista`, `extrairDadosMontaFrase`, `normalizarCorreta`.

#### [NEW] [state.js](file:///e:/Fabular-main/js/models/state.js)
Manages the application state, user progress tracking, synchronization with the API, and XP/level mechanics.
- Globals: `estado`.
- Functions: `salvarEstado`, `carregarEstado`, `garantirContadoresRelatorio`, `obterVinculoCrianca`, `obterResponsavelId`, `agendarSyncProgresso`, `enviarSyncProgresso`, `carregarProgressoDoServidor`, `mesclarProgressoServidor`, `adicionarExperiencia`, `calcularNivelPorXp`, `obterFaixaXpAtual`, `recalcularTotalEstrelas`.

---

### 2. View Layer
The View layer handles DOM rendering, UI transitions, speech syntheses, and toast notifications.

#### [NEW] [accessibilityView.js](file:///e:/Fabular-main/js/views/accessibilityView.js)
Controls accessibility settings like font size adjustments, high contrast/dark mode toggling, text-to-speech, and toast feedback.
- Functions: `ajustarFonte`, `aplicarModoNoturno`, `carregarModoNoturno`, `toggleContraste`, `ouvirTexto`, `falarTexto`, `mostrarToast`.

#### [NEW] [libraryView.js](file:///e:/Fabular-main/js/views/libraryView.js)
Renders the story library screen and sets up filters.
- Functions: `renderizarBiblioteca`, `inicializarFiltros`, `aplicarFaixaDoPerfilNosFiltros`, `labelGenero`, `labelFaixa`, `renderEstrelas`.

#### [NEW] [readingView.js](file:///e:/Fabular-main/js/views/readingView.js)
Renders the step-by-step reading interfaces, interactive phase questions, and full-text reading modes.
- Functions: `renderizarFase`, `renderizarInteracao`, `responderEscolha`, `responderCompletarFeedback`, `mostrarFeedbackFase`, `ocultarFeedback`, `avancarFase`, `pularFase`, `lerTextoCompletoHistoria`, `setUiLeituraModoCompleto`, `mostrarLeituraCompleta`, `obterTextoCompletoHistoria`.

#### [NEW] [minigameView.js](file:///e:/Fabular-main/js/views/minigameView.js)
Contains the layout engine and specific rendering templates for all 11 minigames.
- Functions: `iniciarMinigames`, `iniciarSequenciaMinigames`, `renderizarMinigame`, `mostrarFeedbackMG`, `proximoMinigame`, `finalizarMinigames`, `nomeMinigame`, `registrarEventoMG`, `renderMemoria`, `renderSomPalavra`, `renderEscolhaMG`, `renderCompletarMG`, `renderColorirMG`, `renderMontaFrase`, `renderVerdadeiroFalso`, `renderCacaPalavras`, `renderLigarPoints` (and SVG redrawing), `renderRima`, `renderQuemDisse`, `renderOrdenarPassos`.

#### [NEW] [progressView.js](file:///e:/Fabular-main/js/views/progressView.js)
Renders the user progress dashboard, XP bar indicators, stats, child activity calendar, and parent reports.
- Functions: `atualizarTelaProgresso`, `renderizarAcessoRelatorioResponsavel`, `renderizarCalendarioAtividade`, `agruparAtividadePorDia`, `nivelAtividadeDia`, `niveisOrdem`.

#### [NEW] [iaView.js](file:///e:/Fabular-main/js/views/iaView.js)
Renders AI narrative generation inputs and hooks up model configuration forms.
- Functions: `gerarHistoriaIa`, `gerarHistoriaBotIa`, `inicializarGeneroBotIa`, `obterGeneroSelecionadoBotIa`, `definirGeneroSelecionadoBotIa`, `buildSystemPromptGroq`, `montarBodySalvarHistoriaGroq`, `mapStoryDetailToLegacy`, `mapMinigameGroqParaApi`.

---

### 3. Controller & Integration Layer
Connects Models with Views and routes user events.

#### [NEW] [appController.js](file:///e:/Fabular-main/js/controllers/appController.js)
Orchestrates page routing, links click actions to views, and runs application bootstrap routines.
- Functions: `irParaTela`, `atualizarHeader`, `inicializar`, `injetarEstilosNovos`.

#### [DELETE] [app.js](file:///e:/Fabular-main/app.js)
The massive monolithic file will be deleted once fully split.

---

### 4. General Folders Cleanup
We will move other static script assets into the unified `js/` folder structure.

#### [MODIFY] [login.js](file:///e:/Fabular-main/js/login.js)
Move `login.js` from root into the `js/` folder.

#### [MODIFY] [script.js](file:///e:/Fabular-main/js/script.js)
Move `script.js` (landing page script) from root into the `js/` folder.

#### [MODIFY] [index.html](file:///e:/Fabular-main/index.html)
Update script declarations to load our organized MVC files in order:
```html
<script src="js/models/stories.js"></script>
<script src="js/models/state.js"></script>
<script src="js/views/accessibilityView.js"></script>
<script src="js/views/iaView.js"></script>
<script src="js/views/libraryView.js"></script>
<script src="js/views/readingView.js"></script>
<script src="js/views/minigameView.js"></script>
<script src="js/views/progressView.js"></script>
<script src="js/controllers/appController.js"></script>
```

#### [MODIFY] [login.html](file:///e:/Fabular-main/login.html)
Update script path to `<script src="js/login.js"></script>`.

#### [MODIFY] [qmsomos.html](file:///e:/Fabular-main/qmsomos.html)
Update script path to `<script src="js/script.js"></script>`.

---

## Verification Plan

### Manual Verification
1. **Login Flow**: Open `login.html`, register a child profile, log in, and ensure it correctly redirects to `index.html`.
2. **Library & Filters**: Toggle story categories (Poético, Narrativo, etc.) and check if the stories are filtered correctly.
3. **Reading Flow**: Open a story, advance through the phases, highlight keywords, trigger TTS, and proceed to the reading summary.
4. **Minigames**: Ensure each minigame (Memory, Word search, True/False, Word orders, etc.) renders, supports user inputs, registers correct/incorrect answers, and displays feedback.
5. **Dashboard & Accessibility**: Ensure contrast settings, font-sizing adjustments, XP progress, and the calendar are rendered correctly.
