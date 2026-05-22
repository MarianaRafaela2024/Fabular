# TCC — Mundo das Histórias

Ambiente Virtual de Alfabetização Narrativa focado em leitura guiada + minigames pedagógicos, totalmente em **HTML/CSS/JavaScript (vanilla)** e persistência em **`localStorage`** do navegador.

Este repositório contém o **MVP cliente** e uma **API backend .NET 8** para autenticação, vínculo de perfis infantis, geração/listagem de histórias e sincronização de progresso.

- páginas: `qmsomos.html` (institucional), `login.html` (criança + portão parental + responsável/perfis) e `index.html` (aplicação principal);
- lógica: `login.js` e `app.js`;
- estilos: `style.css` (app + login) e `css.css` (landing).

## Fluxo do sistema

1. **Landing** (`qmsomos.html`): página “Quem somos” com link para entrar.
2. **Login da criança** (`login.html`):
   - nome/apelido;
   - escolha de avatar;
   - faixa etária (5–6, 7–8, 9–10);
   - gênero textual favorito.
3. **Portão parental** (modal em `login.html` / `login.js`):
   - gera contas de **adição, subtração, multiplicação e divisão inteira**;
   - até 3 tentativas; em excesso, aplica bloqueio temporário;
   - ao acertar, grava `portaoAprovado` no `localStorage`.
4. **Login/cadastro do responsável** (primeiro acesso no dispositivo):
   - feito no próprio `login.html`, armazenando dados em `localStorage` (sem servidor);
   - nos acessos seguintes, a sessão do responsável é reaproveitada.
5. **Seleção de perfil**:
   - o responsável vê os perfis de crianças vinculados à conta;
   - pode **adicionar** o perfil recém-preenchido da criança;
   - ao escolher um perfil, o sistema grava o perfil ativo e entra no app.
6. **App principal** (`index.html` + `app.js`):
   - biblioteca de histórias por **gênero** e **faixa etária**;
   - leitura em fases com interações (`escolha` e `completar`);
   - após a leitura, exibe o **texto completo** e inicia um bloco de **4 minigames** adaptados (ex.: jogo da memória, som & palavra, rima, ordenar passos, verdadeiro/falso etc.);
   - sistema de **1 a 3 estrelas** por história, nível (iniciante/intermediário/avançado) e tela de progresso;
   - opções de acessibilidade: ajuste de fonte, alto contraste e TTS (Web Speech API).
7. **Relatório local para o responsável**:
   - a tela de progresso mostra, além de tempo/estrelas, contagem de:
     - tentativas reprovadas,
     - acertos/erros em minigames,
     - uso de “não consigo ouvir” no minigame de som & palavra.

## Tecnologias usadas

- **Frontend:** HTML5, CSS3, JavaScript vanilla.
- **Backend:** ASP.NET Core Web API (.NET 8), Dapper e SQL Server.
- **Persistência:** `localStorage` (fluxo cliente) + banco relacional via API.
- **Acessibilidade:** Web Speech API (`speechSynthesis`) para leitura em voz alta.

## Backend (API-Fabular)

Backend em `backend/API-Fabular` com rotas principais:

- `POST /api/v1/parents/register`
- `POST /api/v1/parents/login`
- `POST /api/v1/children/link-local`
- `POST /api/v1/stories/generate`
- `GET /api/v1/stories`
- `GET /api/v1/stories/{id}`
- `POST /api/v1/sync/progress`

### Arquitetura atual (MVC com evolução para DDD)

- Controllers focados em HTTP (request/response), sem regra de negócio.
- Regras e fluxo de caso de uso em serviços de aplicação (`Services/*`).
- Acesso a banco centralizado em `Infra/DbConnectionFactory` + Dapper.
- Próximo passo recomendado: separar formalmente camadas `Domain`, `Application` e `Infrastructure` com repositórios e testes unitários de domínio.

## Como rodar o sistema

Como é um projeto estático, basta servir os arquivos HTML em um servidor simples.

### Opção 1 — Abrir direto no navegador (para testes rápidos)

1. Navegue até a pasta do projeto (`e:\TCC-main\TCC-main`).
2. Abra `qmsomos.html` ou `login.html` com duplo clique no navegador.

> Alguns navegadores podem restringir `localStorage` ou fontes externas quando abertos via `file://`. Para a apresentação, é mais seguro usar um servidor local (opção 2).

### Opção 2 — Servidor estático simples (recomendado para banca)

Você pode usar qualquer servidor estático (por exemplo, com Node.js instalado):

```bash
cd e:\TCC-main\TCC-main
npx serve .
```

Depois, acesse no navegador o endereço indicado (geralmente `http://localhost:3000`) e entre por `qmsomos.html` ou `login.html`.

### Rodando o backend

```bash
cd backend/API-Fabular
dotnet restore
dotnet run
```

Configurar a connection string `DefaultConnection` em `backend/API-Fabular/appsettings.json`.

## Estrutura de arquivos (resumo)

- `qmsomos.html` — landing institucional.
- `login.html` — login da criança, portão parental, login/cadastro do responsável e seleção de perfil.
- `index.html` — shell da aplicação principal.
- `login.js` — lógica de perfil infantil, portão (com +/−/×/÷), controle de tentativas/bloqueio e fluxo responsável/perfis em `localStorage`.
- `app.js` — histórias, leitura por fases, motor de minigames (4 por história), estrelas, progresso e acessibilidade.
- `style.css` — layout moderno da aplicação e login.
- `css.css` — estilos específicos da landing `qmsomos.html`.

## Notas para a monografia

- Este repositório demonstra um **MVP totalmente cliente** que já:
  - respeita as faixas etárias e gêneros textuais;
  - implementa o portão parental com operações variadas;
  - aplica minigames alinhados ao texto;
  - mantém dados mínimos de progresso e relatório no próprio navegador.
- O plano de trabalho (backend, MySQL e IA) está documentado separadamente e pode ser implementado depois sem refazer o motor de minigames, pois tudo já segue um padrão de **tipos bem definidos** no frontend.
