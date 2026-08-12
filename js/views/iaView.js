/* =============================================
   MUNDO DAS HISTÓRIAS — iaView.js (View)
   ============================================= */

'use strict';

async function gerarHistoriaIa() {
  const ta = document.getElementById('ia-prompt');
  const errEl = document.getElementById('ia-gerar-erro');
  const btn = document.getElementById('btn-gerar-historia');
  if (!ta || !btn) return;
  const prompt = ta.value.trim();
  if (!prompt) {
    if (errEl) {
      errEl.textContent = 'Escreva uma ideia ou tema para a história.';
      errEl.classList.remove('oculto');
    }
    return;
  }
  if (errEl) errEl.classList.add('oculto');
  btn.disabled = true;
  try {
    const vinculo = obterVinculoCrianca();
    if (!vinculo?.criancaId) {
      if (errEl) {
        errEl.textContent = 'Vincule o perfil da criança ao responsável para gerar histórias.';
        errEl.classList.remove('oculto');
      }
      return;
    }
    const responsavelId = obterResponsavelId();
    const body = {
      faixaEtaria: estado.perfil.faixa || 1,
      generoTextual: estado.perfil.genero || 'narrativo',
      promptCrianca: prompt,
      criancaId: vinculo.criancaId,
      tema: null,
      responsavelId: responsavelId || null
    };
    await apiPost('/api/v1/stories/generate', body);
    ta.value = '';
    await carregarHistoriasDaApi();
    renderizarBiblioteca();
    mostrarToast('História criada! Escolha na lista abaixo ✨');
  } catch (e) {
    if (errEl) {
      errEl.textContent =
        (e && e.message) ||
        'Não foi possível gerar. Confira se a API está rodando (localhost) e o banco configurado.';
      errEl.classList.remove('oculto');
    }
  } finally {
    btn.disabled = false;
  }
}

async function gerarHistoriaBotIa() {
  const promptEl = document.getElementById('bot-ia-prompt');
  const btn = document.getElementById('btn-bot-ia-gerar');
  const errEl = document.getElementById('bot-ia-erro');
  if (!promptEl || !btn) return;

  const prompt = promptEl.value.trim();
  if (!prompt) {
    if (errEl) {
      errEl.textContent = 'Escreva uma ideia para a IA criar a história.';
      errEl.classList.remove('oculto');
    }
    return;
  }

  if (errEl) errEl.classList.add('oculto');
  btn.disabled = true;

  try {
    const faixaSelecionada = parseInt(estado?.perfil?.faixa, 10) || 1;
    const generoSelecionado = obterGeneroSelecionadoBotIa();
    const idade = faixaParaIdade(faixaSelecionada);
    const groqKey = '';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 7000,
        temperature: 0.75,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPromptGroq(idade, generoSelecionado) },
          {
            role: 'user',
            content: `Gere uma história do gênero ${generoSelecionado} para criança de ${idade} anos. Tema da criança: ${prompt}. Retorne somente JSON válido.`
          }
        ]
      })
    });
    if (!response.ok) {
      let detail = '';
      try {
        const err = await response.json();
        detail = err?.error?.message || '';
      } catch (_) { }
      throw new Error(detail || `Erro Groq ${response.status}`);
    }

    const data = await response.json();
    const rawText = extrairJsonTextoGroq(data?.choices?.[0]?.message?.content || '{}');
    let story = null;
    try {
      story = JSON.parse(rawText);
    } catch (_) {
      throw new Error('A Groq retornou um formato inválido de JSON.');
    }
    story = normalizarStoryGroq(story, faixaSelecionada, generoSelecionado);

    let savedId = null;
    const vinculo = obterVinculoCrianca();
    if (vinculo?.criancaId) {
      try {
        const salva = await apiPost(
          '/api/v1/stories/save',
          montarBodySalvarHistoriaGroq(story, vinculo.criancaId, prompt, 'llama-3.3-70b-versatile', obterResponsavelId())
        );
        savedId = salva?.id ?? null;
        if (savedId) Object.assign(story, salva);
      } catch (_) {
        // Banco indisponível ou sem vinculação
      }
    }

    promptEl.value = '';

    const historiaCompleta = mapStoryDetailToLegacy(
      { ...story, faixaEtaria: faixaSelecionada, genero: generoSelecionado },
      savedId
    );

    salvarHistoriaNoCache(historiaCompleta);
    garantirHistoriaNaBiblioteca(historiaCompleta);
    await carregarHistoriasDaApi();
    preservarDetalheHistoriaNaBiblioteca(historiaCompleta.id, historiaCompleta);
    renderizarBiblioteca();

    await iniciarHistoria(historiaCompleta.id, { irLeitura: true });
    const avisoSalvo = savedId
      ? 'História criada e salva no banco! Boa leitura 📖'
      : 'História criada! (salva localmente) 📖';
    mostrarToast(avisoSalvo);
  } catch (e) {
    if (errEl) {
      errEl.textContent = (e && e.message) || 'Não foi possível gerar a história agora.';
      errEl.classList.remove('oculto');
    }
  } finally {
    btn.disabled = false;
  }
}

function obterGeneroSelecionadoBotIa() {
  const ativo = document.querySelector('#bot-ia-genero-grupo .chip.ativo');
  return (ativo && ativo.dataset && ativo.dataset.genero) ? String(ativo.dataset.genero) : 'narrativo';
}

function definirGeneroSelecionadoBotIa(genero) {
  const selecionado = String(genero || 'narrativo');
  const chips = document.querySelectorAll('#bot-ia-genero-grupo .chip');
  chips.forEach((chip) => {
    const ativo = chip.dataset.genero === selecionado;
    chip.classList.toggle('ativo', ativo);
    chip.setAttribute('aria-pressed', ativo ? 'true' : 'false');
  });
}

function inicializarGeneroBotIa() {
  const chips = document.querySelectorAll('#bot-ia-genero-grupo .chip');
  if (!chips.length) return;
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      definirGeneroSelecionadoBotIa(chip.dataset.genero || 'narrativo');
    });
  });
  definirGeneroSelecionadoBotIa(estado.perfil?.genero || 'narrativo');
}

function buildSystemPromptGroq(age, genero) {
  return `Você é um criador de histórias para crianças da terceira infância (5 a 10 anos), especializado em desenvolver narrativas educativas, simples, envolventes e inéditas, adaptadas à idade e aos interesses da criança.

FORMATO DE SAÍDA (OBRIGATÓRIO)

Responda SEMPRE em JSON válido, sem nenhum texto fora do JSON:

{
"titulo": "O Leão Corajoso",
"genero": "narrativo",
"emoji": "leao",
"cena": "floresta noite",
"duracao": "5 min",
"palavrasChave": ["leão", "floresta", "noite", "medo", "amizade"],
"texto": "O <strong class=\"palavra-chave\">leão</strong> vivia na <strong class=\"palavra-chave\">floresta</strong>...",
"minigames": [
{
"tipo": "escolha",
"pergunta": "O que o leão fez?",
"opcoes": ["Correu", "Se escondeu"],
"correta": 0
},
{
"tipo": "monta_frase",
"pergunta": "Monte a frase:",
"palavras": ["leão", "o", "corajoso", "era"],
"frase_correta": "O leão era corajoso"
},
{
"tipo": "verdadeiro_falso",
"pergunta": "A afirmação é verdadeira ou falsa?",
"afirmacao": "O leão tinha medo do escuro.",
"opcoes": ["Verdadeiro", "Falso"],
"correta": 0,
"justificativa": "Ele tinha medo no início da história."
},
{
"tipo": "jogo_memoria",
"pergunta": "Encontre os pares!",
"pares": [
{ "palavra": "leão", "emoji": "🦁" },
{ "palavra": "floresta", "emoji": "🌳" },
{ "palavra": "noite", "emoji": "🌙" }
]
}
]
}

CONFIGURAÇÃO

FAIXA ETÁRIA: ${age}
GÊNERO DE HISTÓRIA: ${genero}

REGRAS DO GÊNERO (OBRIGATÓRIO)

O campo "texto" deve seguir EXATAMENTE o gênero selecionado em ${genero}.

Gêneros permitidos:
- narrativo
- poetico
- instrucional
- descritivo
- informativo

Regras de cada gênero:

narrativo
- Deve contar uma história com personagens, ações, conflito e resolução
- Estrutura com começo, meio e fim
- Pode conter diálogos
- Deve ter progressão narrativa

poetico
- Texto com ritmo leve e linguagem lúdica
- Pode usar rimas, repetições e musicalidade
- Foco em emoção, imaginação e sonoridade
- Não precisa seguir estrutura narrativa tradicional

instrucional
- Deve ensinar algo passo a passo
- Linguagem clara, objetiva e educativa
- Pode usar listas ou sequências de ações
- Explicar tarefas, brincadeiras, cuidados ou atividades simples

descritivo
- Foco em descrever personagens, lugares, objetos ou situações
- Utilizar detalhes sensoriais simples
- Pouca ou nenhuma ação narrativa
- Estimular imaginação visual da criança

informativo
- Explicar um tema de forma educativa e fácil
- Usar fatos simples e curiosidades adequadas à idade
- Linguagem clara e organizada
- Não transformar o texto em narrativa fictícia

O conteúdo do campo "texto" NUNCA deve misturar gêneros principais de forma incoerente.

O gênero escolhido deve influenciar:
- estrutura do texto
- linguagem
- ritmo
- organização
- estilo de escrita

REGRAS ESPECÍFICAS PARA O GÊNERO "poetico" (OBRIGATÓRIO)

Quando ${genero} for "poetico", o campo "texto" deve seguir o formato visual e estrutural de um poema infantil.

Regras obrigatórias:
- Escrever em versos curtos
- Quebrar linhas frequentemente
- Organizar em estrofes
- Linguagem leve, lúdica e musical
- Pode usar rimas suaves
- Pode usar repetição poética
- Evitar parágrafos longos
- Priorizar sonoridade e ritmo
- O poema deve parecer visualmente um poema real

Exemplo de estrutura esperada:

"texto": "As <strong class=\"palavra-chave\">estrelas</strong> brilham no céu,\ncomo pontos de luz no papel.\n\nO pequeno <strong class=\"palavra-chave\">coelho</strong> vai saltando,\nenquanto o vento canta dançando."

IMPORTANTE:
- Utilizar <br> para quebra de linha
- Utilizar <br><br> para separar estrofes
- NÃO escrever como texto corrido
- NÃO transformar o poema em narrativa tradicional
- O ritmo visual deve lembrar livros infantis de poesia

REGRAS GERAIS

A história deve ser inédita
Linguagem simples, clara e adequada à idade
Deve ter começo, meio e fim
Deve ser coerente, fluida e natural
Evitar repetição mecânica
Manter consistência de personagens e cenário
Sempre positiva e segura

RESTRIÇÕES

Não usar violência ou medo intenso
Não abordar temas adultos
Não usar linguagem complexa fora da faixa
Não usar ironia ou sarcasmo
Não ser preconceituoso
Não quebrar coerência narrativa
Não criar história sem conflito

MARCAÇÃO DE PALAVRAS-CHAVE

Durante o texto, destacar palavras importantes usando:

<strong class="palavra-chave">palavra</strong>

TAMANHO DO TEXTO (OBRIGATÓRIO)

5–6 anos: 50 a 300 palavras
7–8 anos: 300 a 1200 palavras
9–10 anos: 1200 a 2000 palavras

Nunca ficar abaixo do mínimo da faixa.

ESTRUTURA POR FAIXA ETÁRIA

5–6 ANOS
Personagem → Problema → Tentativa → Solução feliz
Frases curtas
Vocabulário simples
Narrativa linear

7–8 ANOS
Introdução → Problema → 2–3 obstáculos → Clímax → Resolução
Frases curtas a médias
Pequenas descrições

9–10 ANOS
Múltiplos conflitos
Possíveis subtramas
Linguagem mais rica (sem exagero)
Narrativa mais elaborada

MINIGAMES (OBRIGATÓRIO)

Gerar EXATAMENTE 4 minigames
Todos diferentes entre si
Baseados na história
Adequados à idade

Tipos possíveis:
- escolha
- completar
- verdadeiro_falso
- quem_disse
- ordenar_passos
- monta_frase
- som_palavra
- colorir
- rima
- jogo_memoria
- ligar_pontos

REGRAS DOS MINIGAMES

quem_disse:
- só usar se houver diálogo

ordenar_passos:
- mínimo 3 eventos

monta_frase:
- usar frase da história

rima:
- selecionar uma palavra importante presente no texto da história
- a rima correta DEVE SER uma palavra DIFERENTE da palavra selecionada (ex.: leão → balão, lua → rua)
- NUNCA usar a própria palavra da história como a opção de resposta

jogo_memoria:
- usar 3 a 4 palavras-chave da história
- cada par deve ter "palavra" e "emoji" ligados semanticamente (ex.: leão → 🦁, floresta → 🌳, chuva → 🌧️)
- NUNCA usar emoji genérico (⭐, 🌟) se existir emoji que represente a palavra
- NUNCA incluir sufixos de par como "par1" ou "par 1" no campo palavra (escreva apenas a palavra simples, ex: "leão")

escolha:
- fazer uma pergunta direta e contextualizada sobre o gênero e o enredo da história
- a pergunta deve ser adequada ao gênero (ex.: narrativo = fatos do enredo; poético = rimas/sentimentos; instrucional = passos/objetivo; descritivo = cores/detalhes; informativo = explicações/fatos)
- fornecer 3 opções de resposta completas e significativas (NUNCA usar "Opção A" ou textos genéricos)
- indicar o índice da resposta correta (0, 1 ou 2)

ligar_pontos:
- usar 3 a 4 palavras importantes do texto
- cada item deve ter "palavra" e "def" (definição simples e fácil para a criança)
- ex.: { "palavra": "leão", "def": "Rei da selva corajoso" }

Sempre coerentes com a história

QUALIDADE LITERÁRIA

A história deve:
- Ter início envolvente
- Manter progressão natural
- Criar conexão emocional
- Ter ritmo equilibrado
- Usar descrições adequadas à idade
- Ter resolução satisfatória

INSTRUÇÃO FINAL

Gere a história seguindo TODAS as regras acima com máxima precisão, garantindo:
- adequação etária
- qualidade literária
- clareza e naturalidade
- JSON válido
- 4 minigames obrigatórios
- fidelidade total ao gênero selecionado`;
}
