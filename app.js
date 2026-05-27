/* =============================================
   MUNDO DAS HISTÓRIAS — app.js
   Sistema de Alfabetização Narrativa Interativa
   ============================================= */

   'use strict';

   // =============================================
   // 1. DADOS — Banco de histórias e palavras
   // =============================================
   
   const HISTORIAS = [
     // --- NARRATIVO ---
      {
    id: 'n1', genero: 'narrativo', faixa: 1,
    titulo: 'O Leão que Tinha Medo do Escuro',
    emoji: '🦁', cena: '🌙🦁🌳',
    duracao: '5 min',
    fases: [
      {
        texto: 'Era uma vez um <strong class="palavra-chave">leão</strong> chamado <strong class="palavra-chave">Léo</strong>. Ele morava numa <strong class="palavra-chave">floresta</strong> verde e bonita. Léo era grande e forte. Todo mundo achava que ele não tinha medo de nada. Mas Léo tinha um segredo…',
        cena: '🌲🦁🌸',
        interacao: { tipo: 'escolha', pergunta: '😮 Qual era o segredo de Léo?', opcoes: ['Ele tinha medo do escuro.', 'Ele não sabia rugir.'], correta: 0 }
      },
      {
        texto: 'De <strong class="palavra-chave">dia</strong>, Léo brincava com os amigos. Ele corria, pulava e rugia bem alto. Mas quando o <strong class="palavra-chave">sol</strong> ia embora, Léo ficava quietinho. A noite chegava. O escuro chegava. E Léo corria se esconder atrás de uma pedra grande.',
        cena: '☀️🦁🌑',
        interacao: { tipo: 'escolha', pergunta: '🌙 O que acontecia quando a noite chegava?', opcoes: ['Léo ficava quietinho.', 'Léo cantava para os amigos.'], correta: 0 }
      },
      {
        texto: 'Os amigos perguntavam: "Léo, onde você está?" A <strong class="palavra-chave">zebra</strong>, o <strong class="palavra-chave">elefante</strong> e o <strong class="palavra-chave">macaco</strong> procuravam por ele. Léo não respondia. Ele fechava os olhos e esperava o dia voltar.',
        cena: '🦓🐘🐒',
        interacao: { tipo: 'completar', pergunta: '✍️ Complete: Os amigos de Léo eram a zebra, o elefante e o ___', resposta: 'macaco', dica: 'macaco' }
      },
      {
        texto: 'Uma noite, a <strong class="palavra-chave">lua</strong> apareceu bem grande no céu. Ela disse com voz mansa: "Léo, não tenha medo! Eu fico aqui com você toda noite." Léo olhou para o céu. Viu a lua brilhando. Viu as estrelas piscando. E sorriu.',
        cena: '🌕🦁⭐',
        interacao: { tipo: 'escolha', pergunta: '💛 O que a lua disse para o Léo?', opcoes: ['"Eu fico aqui com você toda noite."', '"Vai dormir, Léo!"'], correta: 0 }
      },
      {
        texto: 'Dali em diante, Léo não tinha mais medo. Toda noite ele olhava para a lua e se sentia <strong class="palavra-chave">corajoso</strong>. Ele chamava os amigos para brincar à luz das estrelas. A noite virou a hora favorita de Léo!',
        cena: '🌙🦁🎉',
        interacao: { tipo: 'escolha', pergunta: '🌟 O que mudou para o Léo depois disso?', opcoes: ['A noite virou sua hora favorita.', 'Léo foi embora da floresta.'], correta: 0 }
      }
    ],
    palavrasChave: ['leão', 'floresta', 'noite', 'lua', 'corajoso']
  },
    {
      
    id: 'n2', genero: 'narrativo', faixa: 2,
    titulo: 'A Menina que Colecionava Nuvens',
    emoji: '☁️', cena: '☁️👧🌈',
    duracao: '8 min',
    fases: [
      {
        texto: 'Marina tinha um hobby que ninguém mais tinha: ela <strong class="palavra-chave">colecionava nuvens</strong>. Não as nuvens de verdade, claro — essas não dá para guardar numa caixa. Marina colecionava os <strong class="palavra-chave">desenhos</strong> delas. Toda manhã, antes do café, ela corria para a janela do seu quarto e ficava olhando o céu por alguns minutos. Se a nuvem tinha um formato interessante, ela pegava o caderno azul e desenhava com cuidado. Já eram mais de cem desenhos. Cada um tinha um nome diferente, escolhido por ela.',
        cena: '☁️👧🖍️',
        interacao: { tipo: 'escolha', pergunta: '🤔 Como Marina colecionava nuvens?', opcoes: ['Ela desenhava as nuvens num caderno.', 'Ela fotografava todas as manhãs.'], correta: 0 }
      },
      {
        texto: 'Havia a nuvem "Baleia Voadora", a "Bota do Gigante" e até uma chamada "Avó Dormindo". Os colegas da escola achavam graça. "Nuvens? Mas elas somem!", diziam. Marina só dava de ombros. Ela sabia que justamente por isso eram especiais: cada nuvem existia <strong class="palavra-chave">uma única vez</strong>. Nenhuma voltava igual.',
        cena: '👧📒🌤️',
        interacao: { tipo: 'completar', pergunta: '✍️ Para Marina, cada nuvem era especial porque existia apenas ___ vez', resposta: 'uma única', dica: 'uma única' }
      },
      {
        texto: 'Numa terça-feira de outubro, uma nuvem diferente de todas apareceu no céu. Era enorme, escura nas bordas, mas com o centro branco e brilhante. E o formato… era de um <strong class="palavra-chave">dragão</strong>. Tinha pescoço longo, asas abertas e até o que parecia ser fogo saindo da boca. Marina ficou paralisada. Era a nuvem mais incrível que ela já tinha visto.',
        cena: '🐉☁️👧',
        interacao: { tipo: 'escolha', pergunta: '🐉 O que tornava aquela nuvem tão especial?', opcoes: ['Tinha formato de dragão com asas abertas.', 'Era completamente preta e enorme.'], correta: 0 }
      },
      {
        texto: 'Ela correu para pegar o caderno — mas quando voltou, a nuvem já estava mudando. O pescoço virou uma colina. As asas viraram ondas. Marina sentiu um aperto no peito. Então lembrou: o celular! Ela fotografou o que restava da nuvem-dragão. Não era perfeito, mas dava para ver um pouco das asas ainda abertas.',
        cena: '📱☁️😮',
        interacao: { tipo: 'escolha', pergunta: '📸 Por que Marina usou o celular em vez do caderno?', opcoes: ['A nuvem estava mudando rápido demais.', 'Ela tinha perdido o caderno.'], correta: 0 }
      },
      {
        texto: 'Um mês depois, Marina olhou pela janela e não acreditou: o <strong class="palavra-chave">dragão</strong> tinha voltado! Igual. Com pescoço longo, asas e tudo. Ela correu com o caderno e dessa vez desenhou tudo, com calma. E no mês seguinte, voltou de novo. E no outro também. Marina descobriu que aquela nuvem aparecia sempre que o vento vinha do sul. Ela deu um nome para ela: <strong class="palavra-chave">Fogo</strong>. E toda vez que Fogo aparecia, Marina sabia: ia ser um dia especial.',
        cena: '📷☁️🌟',
        interacao: { tipo: 'completar', pergunta: '✍️ Marina percebeu que a nuvem aparecia quando o vento vinha do ___', resposta: 'sul', dica: 'sul' }
      }
    ],
    palavrasChave: ['colecionava', 'nuvens', 'desenhos', 'dragão', 'Fogo']
},
      {
  id: 'n3', genero: 'narrativo', faixa: 3,
  titulo: 'O Guardião da Biblioteca Secreta',
  emoji: '📚', cena: '📚🔑🏛️',
  duracao: '12 min',
  fases: [
    {
      texto: 'Pedro tinha o hábito de não prestar atenção nas coisas. Não por descuido, exatamente — era mais uma questão de <strong class="palavra-chave">escolha</strong>. O mundo tinha partes interessantes e partes que não valiam o esforço, e Pedro achava que sabia muito bem distinguir uma coisa da outra. A porta marrom no fundo do corredor da escola, por exemplo, claramente pertencia à segunda categoria. Era velha, sem plaquinha, sem maçaneta especial. Provavelmente um depósito de vassouras. Ele tinha passado por ela centenas de vezes sem pestanejar.',
      cena: '🚪👦🏫',
      interacao: { tipo: 'escolha', pergunta: '🔍 Por que Pedro nunca prestou atenção na porta marrom?', opcoes: ['Ele achava que era só um depósito sem importância.', 'A porta estava sempre trancada com cadeado.'], correta: 0 }
    },
    {
      texto: 'Até aquela quinta-feira. Pedro voltava da aula de ciências com a cabeça ainda cheia de perguntas que o professor não soubera responder — ou não quisera. Ao passar pelo corredor, percebeu algo diferente: a porta estava <strong class="palavra-chave">entreaberta</strong>. Uma fresta fina. E por ela vazava uma luz que não era de lâmpada. Era dourada demais. Quente demais. Pedro parou. Olhou para os dois lados do corredor. Não havia ninguém. Ele empurrou a porta devagar.',
      cena: '🚪✨👦',
      interacao: { tipo: 'escolha', pergunta: '💡 O que chamou a atenção de Pedro na porta naquele dia?', opcoes: ['Ela estava entreaberta com uma luz dourada vazando.', 'Tinha um bilhete colado com seu nome.'], correta: 0 }
    },
    {
      texto: 'O que havia do outro lado não cabia na lógica de um depósito de vassouras. Era uma <strong class="palavra-chave">biblioteca enorme</strong> — alta demais para caber num prédio térreo, larga demais para estar dentro da escola. As prateleiras iam do chão ao teto e se curvavam levemente, como se o cômodo fosse redondo. E os livros brilhavam. Não todos — mas muitos tinham um leve pulsar de luz na lombada, como se respirassem. Pedro sentiu que deveria ter medo. Mas o que sentiu foi outra coisa: <strong class="palavra-chave">reconhecimento</strong>. Como se aquele lugar já o esperasse há tempo.',
      cena: '📚✨🏛️',
      interacao: { tipo: 'completar', pergunta: '✍️ Em vez de medo, Pedro sentiu algo inesperado: ___', resposta: 'reconhecimento', dica: 'reconhecimento' }
    },
    {
      texto: '"Você demorou." A voz veio de algum lugar entre as prateleiras. Pedro deu um passo atrás — mas não saiu. Uma <strong class="palavra-chave">raposa</strong> surgiu caminhando devagar, óculos de aros dourados equilibrados na ponta do focinho, um livro aberto na pata esquerda. Ela se sentou numa cadeira de veludo vermelho como se aquilo fosse a coisa mais natural do mundo. "Cada guardião demora um tempo diferente para encontrar a biblioteca", ela disse. "Alguns levam dias. Outros, anos. Você levou três." Pedro abriu a boca. "Três o quê?" "Anos de escola", respondeu a raposa, virando uma página.',
      cena: '🦊📖🏛️',
      interacao: { tipo: 'escolha', pergunta: '🦊 O que a raposa quis dizer com "você demorou"?', opcoes: ['Pedro levou três anos de escola para encontrar a biblioteca.', 'A raposa o esperava desde a manhã.'], correta: 0 }
    },
    {
      texto: 'A raposa explicou com a paciência de quem já explicou a mesma coisa muitas vezes — e ainda assim não achava a explicação cansativa. Cada livro naquela biblioteca guardava uma <strong class="palavra-chave">história verdadeira</strong>: não necessariamente um fato histórico, mas algo que havia sido sentido de verdade por alguém, em algum lugar, em algum tempo. "Histórias verdadeiras precisam ser lidas", ela disse. "Quando ninguém lê, elas enfraquecem. A lombada perde o brilho. E quando o brilho some de vez…" Ela fechou o livro com cuidado. "A história desaparece. Como se nunca tivesse acontecido."',
      cena: '🦊📖💫',
      interacao: { tipo: 'escolha', pergunta: '📖 O que acontece com uma história quando ninguém a lê?', opcoes: ['Ela perde o brilho e desaparece para sempre.', 'Ela se transforma em outro livro automaticamente.'], correta: 0 }
    },
    {
      texto: 'Pedro passou aquela tarde inteira na biblioteca. Leu sobre uma <strong class="palavra-chave">civilização</strong> que construía cidades nas copas das árvores e desapareceu antes de ser descoberta. Leu o diário de uma menina que vivia numa estação espacial e sentia saudade da chuva. Leu a história de um urso que tinha aprendido a escrever sozinho e deixado cartas escondidas em ocos de árvores pela floresta. Cada livro tinha um brilho diferente. Alguns pulsavam devagar, como coração em repouso. Outros tremiam um pouco, como se tivessem pressa de ser lidos.',
      cena: '🌍🪐🦕',
      interacao: { tipo: 'completar', pergunta: '✍️ Pedro leu sobre uma civilização que construía cidades nas copas das ___', resposta: 'árvores', dica: 'árvores' }
    },
    {
      texto: 'Quando saiu, o corredor estava vazio e as luzes da escola já tinham sido apagadas. Pedro ficou parado diante da porta marrom, agora fechada de novo. Entendeu, naquele momento, o que a raposa quis dizer. Ser <strong class="palavra-chave">guardião</strong> não era uma tarefa de vigia — não era trancar a biblioteca, catalogar os livros, protegê-los do pó. Era outra coisa, mais difícil e mais simples ao mesmo tempo: era carregar as histórias dentro de si. Lembrar delas. Deixar que mudassem alguma coisa. Porque uma história só existe de verdade quando alguém a leva para fora da página.',
      cena: '👦🚪🌟',
      interacao: { tipo: 'escolha', pergunta: '💭 Qual é o verdadeiro papel de um guardião de histórias?', opcoes: ['Carregar as histórias dentro de si e deixar que elas mudem algo nele.', 'Proteger os livros do pó e catalogar a biblioteca.'], correta: 0 }
    }
  ],
  palavrasChave: ['biblioteca', 'guardião', 'reconhecimento', 'civilização', 'histórias verdadeiras']
},
   
     // --- POÉTICO ---
    {
  id: 'p1', genero: 'poetico', faixa: 1,
  titulo: 'A Chuva Cantando',
  emoji: '🌧️', cena: '🌧️🌈☂️',
  duracao: '4 min',
  fases: [
    {
      texto: '<em>"Pingo, pingo, pinguinho,<br>a chuva veio sim!<br>Molhou o passarinho,<br>molhou o meu jardim."</em>',
      cena: '🌧️🐦🌸',
      interacao: { tipo: 'escolha', pergunta: '🎵 O que a chuva molhou no verso?', opcoes: ['O passarinho e o jardim.', 'O sol e a lua.'], correta: 0 }
    },
    {
      texto: '<em>"Pingo, pingo, pinguinho,<br>que gostoso é assim!<br>A chuva faz barulho:<br>tim-tim, tim-tim, tim-tim!"</em>',
      cena: '🌧️👂🎶',
      interacao: { tipo: 'completar', pergunta: '✍️ A chuva faz barulho: ___', resposta: 'tim-tim', dica: 'tim-tim' }
    },
    {
      texto: '<em>"E eu de guarda-chuva,<br>saí para brincar!<br>Com poça lá na rua,<br>que gostoso pular!"</em>',
      cena: '☂️💦👧',
      interacao: { tipo: 'completar', pergunta: '✍️ Que gostoso pular na ___', resposta: 'poça', dica: 'poça' }
    },
    {
      texto: '<em>"Pingo, pingo, pinguinho,<br>não para, não, não!<br>A chuva é minha amiga,<br>vem, chuva, venha cá!"</em>',
      cena: '🌧️💛🌈',
      interacao: { tipo: 'escolha', pergunta: '💛 Como a criança chama a chuva no final?', opcoes: ['De amiga.', 'De chateada.'], correta: 0 }
    }
  ],
  palavrasChave: ['pingo', 'chuva', 'passarinho', 'jardim', 'poça']
},
{
  id: 'p2', genero: 'poetico', faixa: 2,
  titulo: 'Palavras que Voam',
  emoji: '🦋', cena: '🦋🌸📜',
  duracao: '6 min',
  fases: [
    {
      texto: '<em>"Palavras são pássaros<br>que moram no papel,<br>guardam segredos doces<br>mais doces que o mel."</em>',
      cena: '🐦📄🍯',
      interacao: { tipo: 'escolha', pergunta: '🍯 Com o que as palavras são comparadas neste verso?', opcoes: ['Com pássaros que moram no papel.', 'Com flores no jardim.'], correta: 0 }
    },
    {
      texto: '<em>"Quando você as lê,<br>elas ganham asas,<br>atravessam a noite<br>e chegam nas casas."</em>',
      cena: '🦋🏠🌙',
      interacao: { tipo: 'completar', pergunta: '✍️ Quando lidas, as palavras ganham ___', resposta: 'asas', dica: 'asas' }
    },
    {
      texto: '<em>"Há palavras mansas<br>que chegam de mansinho,<br>como luz de vela<br>no fim do caminho."</em>',
      cena: '🕯️🌿🐾',
      interacao: { tipo: 'escolha', pergunta: '🕯️ A que são comparadas as palavras mansas?', opcoes: ['À luz de vela no fim do caminho.', 'Ao barulho do vento na janela.'], correta: 0 }
    },
    {
      texto: '<em>"Há palavras bravas<br>que saltam do chão,<br>e batem no peito<br>feito coração."</em>',
      cena: '❤️💥📢',
      interacao: { tipo: 'escolha', pergunta: '❤️ O que as palavras bravas fazem segundo o poema?', opcoes: ['Batem no peito feito coração.', 'Voam alto pelo céu.'], correta: 0 }
    },
    {
      texto: '<em>"Guarda bem as tuas,<br>escolhe com cuidado —<br>uma palavra dita<br>não volta ao seu lado."</em>',
      cena: '🦋🌸📜',
      interacao: { tipo: 'completar', pergunta: '✍️ Uma palavra dita não volta ao seu ___', resposta: 'lado', dica: 'lado' }
    }
  ],
  palavrasChave: ['palavras', 'pássaros', 'papel', 'asas', 'segredos']
  },
   
     // --- INSTRUCIONAL ---
     {
       id: 'i1', genero: 'instrucional', faixa: 1,
       titulo: 'Como Fazer uma Casinha para Pássaros',
       emoji: '🏡', cena: '🐦🏠🔨',
       duracao: '6 min',
       fases: [
         {
           texto: 'Você vai precisar de: uma caixa de <strong class="palavra-chave">sapato</strong>, tinta colorida, palitos de madeira e cola. Essa casinha vai ser um lar aconchegante para os pássaros do jardim!',
           cena: '📦🎨🐦',
           interacao: { tipo: 'escolha', pergunta: '📦 O que é o material principal da casinha?', opcoes: ['Caixa de sapato.', 'Pedaços de telhado.'], correta: 0 }
         },
         {
           texto: 'Passo 1: Pinte a caixa com cores vivas. Passo 2: Cole os <strong class="palavra-chave">palitos</strong> na entrada para fazer o poleiro. Passo 3: Faça um buraco na frente com o tamanho certo para o pássaro entrar!',
           cena: '🎨📦🔵',
           interacao: { tipo: 'completar', pergunta: '✍️ Cole os ___ para fazer o poleiro', resposta: 'palitos', dica: 'palitos' }
         }
       ],
       palavrasChave: ['sapato', 'palitos', 'pinte', 'buraco', 'poleiro']
     },
     {
       id: 'i2', genero: 'instrucional', faixa: 3,
       titulo: 'Receita: Slime Caseiro',
       emoji: '🟢', cena: '🧪🟢✋',
       duracao: '10 min',
       fases: [
         {
           texto: 'O slime caseiro é uma atividade científica divertida! Ingredientes necessários: 1 frasco de cola branca (PVA), 1 colher de chá de <strong class="palavra-chave">bicarbonato</strong> de sódio, solução de lente de contato (com ácido bórico) e corante alimentício.',
           cena: '🧪🔬⚗️',
           interacao: { tipo: 'escolha', pergunta: '🧪 Qual ingrediente ativa o slime?', opcoes: ['A solução de lente de contato.', 'A cola branca.'], correta: 0 }
         },
         {
           texto: 'Modo de preparo: Misture a cola com o bicarbonato. Adicione o <strong class="palavra-chave">corante</strong>. Aos poucos, vá acrescentando a solução de lente e mexa até obter a consistência elástica. O segredo é não adicionar solução demais!',
           cena: '🟢✋🔀',
           interacao: { tipo: 'completar', pergunta: '✍️ Adicione o ___ para dar cor', resposta: 'corante', dica: 'corante' }
         }
       ],
       palavrasChave: ['bicarbonato', 'cola', 'corante', 'solução', 'elástica']
     },
   
     // --- DESCRITIVO ---
     {
  id: 'd1', genero: 'descritivo', faixa: 2,
  titulo: 'O Fundo do Mar Encantado',
  emoji: '🌊', cena: '🐠🌊🐙',
  duracao: '7 min',
  fases: [
    {
      texto: 'O fundo do mar é um mundo à parte — um lugar que poucos olhos já viram de verdade, mas que existe cheio de vida bem abaixo das ondas. A primeira coisa que chama atenção é a <strong class="palavra-chave">luz</strong>: ela chega filtrada pela água, formando raios dourados e tremidos que iluminam tudo como lanternas gigantes balançando no teto.',
      cena: '🌊✨🐠',
      interacao: { tipo: 'escolha', pergunta: '💡 Como a luz do sol aparece no fundo do mar?', opcoes: ['Em raios dourados e tremidos, como lanternas balançando.', 'Forte e direta, iluminando tudo de uma vez.'], correta: 0 }
    },
    {
      texto: 'Logo se vê o conjunto de <strong class="palavra-chave">cores vibrantes</strong> que cobre o fundo. Corais <strong class="palavra-chave">laranja e rosa</strong> crescem em formas curiosas — alguns parecem árvores, outros parecem leques abertos, outros ainda parecem cérebros de pedra. Juntos, formam verdadeiras florestas subaquáticas, com suas próprias ruas, esquinas e esconderijos.',
      cena: '🐠🐡🌿',
      interacao: { tipo: 'escolha', pergunta: '🎨 A que o texto compara os corais juntos?', opcoes: ['A florestas com ruas, esquinas e esconderijos.', 'A jardins de flores coloridas na superfície.'], correta: 0 }
    },
    {
      texto: 'Entre os corais, peixes de todas as formas dançam sem parar. Alguns são listrados de preto e branco, outros têm manchas amarelas e azuis que parecem pintadas à mão. As algas verdes e compridas balançam suavemente na corrente, como se ouvissem uma música que só elas conhecem. Tudo ali se move — nada fica completamente parado.',
      cena: '🐟🌿🎶',
      interacao: { tipo: 'completar', pergunta: '✍️ As algas balançam na corrente como se ouvissem uma ___ que só elas conhecem', resposta: 'música', dica: 'música' }
    },
    {
      texto: 'No chão do oceano, o ritmo é outro. Estrelas-do-mar de cor <strong class="palavra-chave">avermelhada</strong> caminham devagar sobre a areia branca, como se tivessem todo o tempo do mundo. Polvos curiosos esticam seus <strong class="palavra-chave">tentáculos</strong> para explorar conchas, pedras e frestas escuras. De vez em quando, uma nuvem de areia sobe do fundo — sinal de que algum ser passou por ali e preferiu não ser visto.',
      cena: '⭐🐙🐚',
      interacao: { tipo: 'escolha', pergunta: '🐙 O que a nuvem de areia no fundo indica?', opcoes: ['Que algum ser passou por ali sem querer ser visto.', 'Que uma tempestade está chegando na superfície.'], correta: 0 }
    },
    {
      texto: 'O fundo do mar não tem som da forma que conhecemos — mas não é silêncioso. Há o rangido suave dos corais, o farfalhar das algas, o movimento constante da água. É um <strong class="palavra-chave">silêncio cheio</strong>, como o de uma biblioteca grande onde todos estão muito ocupados. Quem mergulha fundo o suficiente entende: o mar não está vazio. Ele só guarda seus segredos com muito cuidado.',
      cena: '🌊🐠🌊',
      interacao: { tipo: 'completar', pergunta: '✍️ O texto chama o som do fundo do mar de "silêncio ___"', resposta: 'cheio', dica: 'cheio' }
    }
  ],
  palavrasChave: ['cores', 'corais', 'vibrantes', 'avermelhada', 'tentáculos']
},
{
  id: 'd2', genero: 'descritivo', faixa: 1,
  titulo: 'O Jardim da Vovó',
  emoji: '🌻', cena: '🌻🌹🦋',
  duracao: '5 min',
  fases: [
    {
      texto: 'O jardim da <strong class="palavra-chave">vovó</strong> é cheio de flores! Tem rosas <strong class="palavra-chave">vermelhas</strong>, margaridas brancas e girassóis altos e amarelos. As cores são lindas! O cheiro é muito <strong class="palavra-chave">gostoso</strong>.',
      cena: '🌹🌼🌻',
      interacao: { tipo: 'escolha', pergunta: '🌻 Que flores tem no jardim da vovó?', opcoes: ['Rosas, margaridas e girassóis.', 'Orquídeas e tulipas.'], correta: 0 }
    },
    {
      texto: 'As <strong class="palavra-chave">borboletas</strong> adoram esse jardim. Elas pousam nas flores e ficam quietinhas. Os passarinhos também vêm por aqui. Eles cantam alto e alegram o jardim todo.',
      cena: '🦋🌸🐦',
      interacao: { tipo: 'escolha', pergunta: '🦋 Quais bichinhos visitam o jardim?', opcoes: ['Borboletas e passarinhos.', 'Abelhas e sapos.'], correta: 0 }
    },
    {
      texto: 'No meio do jardim tem um <strong class="palavra-chave">banco de madeira</strong>. Ele é velho e tem tinta descascada. A vovó senta ali toda tarde. Ela toma chá e fica olhando as flores. É o lugar mais <strong class="palavra-chave">tranquilo</strong> do mundo!',
      cena: '🪑☕🌿',
      interacao: { tipo: 'completar', pergunta: '✍️ A vovó senta no banco e toma ___', resposta: 'chá', dica: 'chá' }
    }
  ],
  palavrasChave: ['vovó', 'vermelhas', 'gostoso', 'banco', 'tranquilo']
},//parei aq
   
     // --- INFORMATIVO ---
     {
       id: 'inf1', genero: 'informativo', faixa: 2,
       titulo: 'Por Que o Céu é Azul?',
       emoji: '🔵', cena: '☀️🔵🌍',
       duracao: '8 min',
       fases: [
         {
           texto: 'A luz do Sol parece branca, mas na verdade ela é formada por todas as <strong class="palavra-chave">cores do arco-íris</strong>! Quando essa luz atravessa a atmosfera da Terra, ela encontra partículas minúsculas de ar.',
           cena: '☀️🌈🌍',
           interacao: { tipo: 'escolha', pergunta: '🌈 De que é formada a luz do Sol?', opcoes: ['De todas as cores do arco-íris.', 'Apenas da cor amarela.'], correta: 0 }
         },
         {
           texto: 'Essas partículas <strong class="palavra-chave">espalham</strong> a cor azul muito mais do que as outras cores. Por isso, onde quer que olhemos para o céu, vemos azul! À noite, sem a luz do Sol, o céu fica <strong class="palavra-chave">escuro</strong>.',
           cena: '🔵💨🌙',
           interacao: { tipo: 'completar', pergunta: '✍️ As partículas ___ a cor azul', resposta: 'espalham', dica: 'espalham' }
         }
       ],
       palavrasChave: ['cores', 'arco-íris', 'espalham', 'partículas', 'atmosfera']
     },
     {
       id: 'inf2', genero: 'informativo', faixa: 3,
       titulo: 'Amazônia: O Pulmão do Mundo',
       emoji: '🌿', cena: '🌳🦜🌊',
       duracao: '12 min',
       fases: [
         {
           texto: 'A <strong class="palavra-chave">Floresta Amazônica</strong> é a maior floresta tropical do planeta. Ela cobre cerca de 5,5 milhões de km² e abrange nove países, sendo o Brasil o de maior extensão. Estima-se que ela abriga mais de 10% de todas as espécies de animais e plantas da Terra.',
           cena: '🌳🌍🦜',
           interacao: { tipo: 'escolha', pergunta: '🌍 Qual país tem a maior parte da Amazônia?', opcoes: ['Brasil.', 'Peru.'], correta: 0 }
         },
         {
           texto: 'A Amazônia é chamada de "pulmão do mundo" porque suas árvores absorvem grandes quantidades de <strong class="palavra-chave">dióxido de carbono</strong> e liberam <strong class="palavra-chave">oxigênio</strong>. Isso ajuda a equilibrar o clima do planeta inteiro.',
           cena: '🌿💨🌱',
           interacao: { tipo: 'completar', pergunta: '✍️ A floresta libera ___ para o ar', resposta: 'oxigênio', dica: 'oxigênio' }
         },
         {
           texto: 'Preservar a Amazônia é responsabilidade de todos. O <strong class="palavra-chave">desmatamento</strong> ameaça milhares de espécies e afeta o regime de chuvas de todo o Brasil. Pequenas ações como consumo consciente e apoio a projetos ambientais fazem diferença.',
           cena: '🌱♻️🤝',
           interacao: { tipo: 'escolha', pergunta: '⚠️ O que ameaça a Amazônia?', opcoes: ['O desmatamento.', 'As chuvas.'], correta: 0 }
         }
       ],
       palavrasChave: ['Amazônica', 'oxigênio', 'desmatamento', 'espécies', 'clima']
     }
   ];
  
  const API_BASE = (window.API_BASE_URL || 'http://localhost:5275').replace(/\/$/, '');
  const CHAVE_VINCULOS = 'mundoHistorias_vinculos_crianca';
  let syncTimer = null;
  
  async function apiGet(path) {
    const resp = await fetch(`${API_BASE}${path}`);
    if (!resp.ok) throw new Error(`Erro ${resp.status}`);
    return resp.json();
  }
  
  async function apiPost(path, body) {
    const resp = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error(`Erro ${resp.status}`);
    return resp.json();
  }
  
  function mapStorySummaryToLegacy(story) {
    return {
      id: `api-${story.id}`,
      genero: story.genero || 'narrativo',
      faixa: story.faixaEtaria || 1,
      titulo: story.titulo || 'História',
      emoji: story.emoji || '📖',
      cena: story.cena || '🌟',
      duracao: story.duracao || '5 min',
      fases: [
        {
          texto: 'História carregada da API. Clique em Jogar para abrir o conteúdo completo.',
          cena: story.cena || '🌟',
          interacao: { tipo: 'escolha', pergunta: 'Pronto para começar?', opcoes: ['Sim', 'Agora não'], correta: 0 }
        }
      ],
      palavrasChave: []
    };
  }
  
  function garantirHistoriaNaBiblioteca(historia) {
    if (!historia || !historia.id) return;
    const idx = HISTORIAS.findIndex((h) => h.id === historia.id);
    if (idx >= 0) HISTORIAS[idx] = historia;
    else HISTORIAS.unshift(historia);
  }

  function preservarDetalheHistoriaNaBiblioteca(id, detalhe) {
    const idx = HISTORIAS.findIndex((h) => h.id === id);
    if (idx < 0) {
      garantirHistoriaNaBiblioteca(detalhe);
      return;
    }
    HISTORIAS[idx] = {
      ...HISTORIAS[idx],
      ...detalhe,
      fases: detalhe.fases || HISTORIAS[idx].fases,
      minigamesPreset: detalhe.minigamesPreset || HISTORIAS[idx].minigamesPreset,
      palavrasChave: detalhe.palavrasChave || HISTORIAS[idx].palavrasChave
    };
  }

  function historiaApiTemTextoCompleto(h) {
    const texto = h?.fases?.[0]?.texto || '';
    return texto.length > 0 && !texto.includes('História carregada da API');
  }

  async function carregarHistoriasDaApi() {
    try {
      const faixa = estado?.perfil?.faixa;
      const vinculo = obterVinculoCrianca();
      const query = new URLSearchParams();
      if (faixa) query.set('faixaEtaria', String(faixa));
      if (vinculo?.criancaId) query.set('criancaId', String(vinculo.criancaId));
      const list = await apiGet(`/api/v1/stories?${query.toString()}`);
      if (!Array.isArray(list) || list.length === 0) return;
      const mapped = list.map(mapStorySummaryToLegacy);
      const manuais = HISTORIAS.filter((h) => !String(h.id).startsWith('api-'));
      const detalhadasApi = HISTORIAS.filter((h) => String(h.id).startsWith('api-') && historiaApiTemTextoCompleto(h));
      const idsDetalhadas = new Set(detalhadasApi.map((h) => h.id));
      const resumosNovos = mapped.filter((h) => !idsDetalhadas.has(h.id));
      HISTORIAS.splice(0, HISTORIAS.length, ...manuais, ...detalhadasApi, ...resumosNovos);
    } catch (_) {}
  }
  
  async function carregarDetalheHistoriaDaApi(id) {
    if (!String(id).startsWith('api-')) return null;
    const serverId = String(id).replace('api-', '');
    const vinculo = obterVinculoCrianca();
    const query = vinculo?.criancaId ? `?criancaId=${encodeURIComponent(vinculo.criancaId)}` : '';
    const data = await apiGet(`/api/v1/stories/${serverId}${query}`);
    const mgRaw = data.minigames != null ? data.minigames : data.Minigames;
    const minigamesPreset = Array.isArray(mgRaw)
      ? mgRaw.map(normalizarMinigamePreset).filter(Boolean)
      : [];
    return {
      id: `api-${data.id}`,
      genero: data.genero,
      faixa: data.faixaEtaria,
      titulo: data.titulo,
      emoji: data.emoji || '📖',
      cena: data.cena || '🌟',
      duracao: data.duracao || '5 min',
      fases: [
        {
          texto: data.texto,
          cena: data.cena || '🌟',
          interacao: { tipo: 'escolha', pergunta: 'Qual foi o ponto principal da história?', opcoes: ['Resolver o problema', 'Desistir'], correta: 0 }
        }
      ],
      palavrasChave: Array.isArray(data.palavrasChave) ? data.palavrasChave : [],
      minigamesPreset
    };
  }
   
   // Banco de minigames por faixa/gênero
   const MINIGAMES_BANCO = {
     narrativo: {
       1: [
         {
           tipo: 'sequencia', titulo: '📸 Ordene a História!',
           enunciado: 'Coloque os eventos na ordem certa:'
         },
         {
           tipo: 'vf', titulo: '✅ Verdadeiro ou Falso?',
           enunciado: 'Sobre a história que você leu, diga se é verdadeiro ou falso:'
         }
       ],
       2: [
         {
           tipo: 'montafrase', titulo: '🧩 Monta-Frase!',
           enunciado: 'Organize as palavras para formar uma frase da história:'
         },
         {
           tipo: 'vf', titulo: '✅ Verdadeiro ou Falso?',
           enunciado: 'Sobre a história, diga se é verdadeiro ou falso:'
         }
       ],
       3: [
         {
           tipo: 'complete', titulo: '✍️ Complete o Texto!',
           enunciado: 'Preencha os espaços com as palavras certas:'
         },
         {
           tipo: 'mc', titulo: '🔎 Detetive do Texto',
           enunciado: 'Responda sobre os detalhes da história:'
         }
       ]
     },
     poetico: {
       1: [
         { tipo: 'rima', titulo: '🎵 Encontre a Rima!', enunciado: 'Escolha a palavra que rima:' },
         { tipo: 'vf', titulo: '✅ Verdadeiro ou Falso?', enunciado: 'Sobre o poema, diga verdadeiro ou falso:' }
       ],
       2: [
         { tipo: 'rima', titulo: '🎵 Completa o Verso!', enunciado: 'Qual palavra completa a rima?' },
         { tipo: 'mc', titulo: '💬 O Que Significa?', enunciado: 'Qual o significado no poema?' }
       ],
       3: [
         { tipo: 'complete', titulo: '✍️ Complete os Versos!', enunciado: 'Preencha os versos do poema:' },
         { tipo: 'mc', titulo: '🔍 Análise Poética', enunciado: 'Responda sobre os recursos do poema:' }
       ]
     },
     instrucional: {
       1: [
         { tipo: 'sequencia', titulo: '📋 Ordene os Passos!', enunciado: 'Coloque as ações na ordem correta:' },
         { tipo: 'vf', titulo: '✅ Correto ou Errado?', enunciado: 'Essa instrução está correta?' }
       ],
       2: [
         { tipo: 'sequencia', titulo: '📋 Sequência Correta!', enunciado: 'Ordene os passos do procedimento:' },
         { tipo: 'mc', titulo: '🔧 Qual o Material?', enunciado: 'Sobre os materiais e ingredientes:' }
       ],
       3: [
         { tipo: 'complete', titulo: '✍️ Complete as Instruções!', enunciado: 'Preencha os espaços:' },
         { tipo: 'mc', titulo: '⚠️ Por Que Esse Passo?', enunciado: 'Qual a razão desse passo?' }
       ]
     },
     descritivo: {
       1: [
         { tipo: 'mc', titulo: '🎨 Qual a Cor?', enunciado: 'Como o texto descreveu:' },
         { tipo: 'vf', titulo: '✅ Verdadeiro ou Falso?', enunciado: 'Essa descrição está correta?' }
       ],
       2: [
         { tipo: 'mc', titulo: '🔍 Palavras do Cenário', enunciado: 'Qual palavra foi usada para descrever?' },
         { tipo: 'montafrase', titulo: '🧩 Descreva!', enunciado: 'Monte a frase descritiva:' }
       ],
       3: [
         { tipo: 'complete', titulo: '✍️ Complete a Descrição!', enunciado: 'Preencha com as palavras certas:' },
         { tipo: 'mc', titulo: '🔎 Detalhe do Texto', enunciado: 'Qual detalhe foi descrito?' }
       ]
     },
     informativo: {
       1: [
         { tipo: 'vf', titulo: '✅ É Verdade?', enunciado: 'Essa informação é verdadeira?' },
         { tipo: 'mc', titulo: '💡 O Que Você Aprendeu?', enunciado: 'Responda sobre o texto:' }
       ],
       2: [
         { tipo: 'vf', titulo: '✅ Verdadeiro ou Falso?', enunciado: 'Sobre o que você leu:' },
         { tipo: 'mc', titulo: '🔎 Destaque a Informação', enunciado: 'Qual a informação correta?' }
       ],
       3: [
         { tipo: 'complete', titulo: '✍️ Complete as Informações!', enunciado: 'Preencha com dados do texto:' },
         { tipo: 'mc', titulo: '📊 Análise das Informações', enunciado: 'Interprete os dados do texto:' }
       ]
     }
   };
   
   // Mensagens motivadoras
   const MSGS_ACERTO = [
     'Incrível! Você é demais! 🌟',
     'Perfeito! Que resposta esperta! 🎉',
     'Muito bem! Continue assim! 🚀',
     'Uhuuul! Você acertou! ⭐',
     'Fantástico! Você é um leitor(a) nato(a)! 📚'
   ];
   const MSGS_ERRO = [
     'Quase lá! Você está aprendendo muito! 💪',
     'Não tem problema! Continue tentando! 🌈',
     'Cada erro nos ensina algo novo! Vamos em frente! 🌟'
   ];
   const MSGS_RESULTADO = {
     3: ['Perfeito! Você é um(a) super leitor(a)! 🏆', 'Incrível! Você arrasou nesta história! 🌟'],
     2: ['Muito bem! Continue assim! 🎉', 'Ótimo trabalho! Você está melhorando! 💪'],
     1: ['Você concluiu! Continue praticando! 💪', 'Parabéns por terminar! Tente de novo! 🌈'],
     0: ['Não desista! Releia a história e tente novamente! 📖', 'Vamos tentar de novo? Você consegue! 💪']
   };
   
   // =============================================
   // 2. ESTADO DA APLICAÇÃO
   // =============================================
    // criou uma variável global "estado" para armazenar todas as informações do usuário, progresso, filtros e configurações de acessibilidade. Isso facilita o gerenciamento dos dados e a persistência usando localStorage.
   let estado = {
     perfil: { nome: '', avatar: '🦁', faixa: 1, genero: 'narrativo' },
     nivel: 'iniciante', // iniciante | intermediario | avancado
     experiencia: 0,
     totalEstrelas: 0,
     historiasLidas: [],  // [{id, estrelas, data}]
     tempoTotal: 0,       // minutos
     minigamesJogados: 0,
    tentativasReprovadas: 0,
     historiaAtual: null,
     faseAtual: 0,
     acertos: 0,
     ajudas: 0,
     minigameAtual: 0,
     minigamesLista: [],
    minigamesPreset: null,
     mgAcertos: 0,
     iniciouEm: null,
     filtroGenero: 'todos',
     filtroFaixa: 'todos',
    destaqueAtivo: false,
    modoLeituraCompleta: false,
    relatorioEventos: [] // eventos locais por minigame
   };
   
   // =============================================
   // 3. PERSISTÊNCIA (localStorage)
   // =============================================
   
   function salvarEstado() {
     const dados = {
       perfil: estado.perfil,
      portaoAprovado: true,
       nivel: estado.nivel,
       experiencia: estado.experiencia || 0,
       totalEstrelas: estado.totalEstrelas,
       historiasLidas: estado.historiasLidas,
       tempoTotal: estado.tempoTotal,
      minigamesJogados: estado.minigamesJogados,
      tentativasReprovadas: estado.tentativasReprovadas,
      relatorioEventos: estado.relatorioEventos,
      relatorioResponsavelLiberado: !!estado.relatorioResponsavelLiberado
     };
     localStorage.setItem('mundoHistorias_estado', JSON.stringify(dados));
    agendarSyncProgresso();
   }
   // criou uma função "salvarEstado" que extrai apenas as partes relevantes do estado para salvar no localStorage, evitando armazenar dados temporários ou de sessão. A função "carregarEstado" tenta recuperar esses dados ao iniciar a aplicação e os mescla com o estado inicial usando Object.assign, garantindo que o estado seja restaurado corretamente sem perder as propriedades temporárias.
   function carregarEstado() {
     const raw = localStorage.getItem('mundoHistorias_estado');
     if (!raw) return;
     try {
       const dados = JSON.parse(raw);
       Object.assign(estado, dados);
     } catch (e) { /* ignora */ }
   }
  
  function obterVinculoCrianca() {
    try {
      const localChildKey = estado?.perfil?.localChildKey;
      if (!localChildKey) return null;
      const vinculos = JSON.parse(localStorage.getItem(CHAVE_VINCULOS) || '{}');
      return vinculos[localChildKey] || null;
    } catch (_) {
      return null;
    }
  }
  
  function agendarSyncProgresso() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      enviarSyncProgresso().catch(() => {});
    }, 800);
  }
  
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
      const body = {
        faixaEtaria: estado.perfil.faixa || 1,
        generoTextual: estado.perfil.genero || 'narrativo',
        promptCrianca: prompt,
        criancaId: vinculo && vinculo.criancaId ? vinculo.criancaId : null,
        tema: null
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

  function faixaParaIdade(faixa) {
    const f = parseInt(faixa, 10) || 1;
    if (f === 1) return 6;
    if (f === 3) return 10;
    return 8;
  }

  // Prompt baseado em "historias-infantis (2).html"
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

REGRAS DOS MINIGAMES

quem_disse:
- só usar se houver diálogo

ordenar_passos:
- mínimo 3 eventos

monta_frase:
- usar frase da história

jogo_memoria:
- usar 3 a 4 palavras-chave da história
- cada par deve ter "palavra" e "emoji" ligados semanticamente (ex.: leão → 🦁, floresta → 🌳, chuva → 🌧️)
- NUNCA usar emoji genérico (⭐, 🌟) se existir emoji que represente a palavra

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

  function normalizarTipoMinigame(tipoRaw) {
    const tipo = String(tipoRaw || '').trim().toLowerCase();
    const aliases = {
      memoria: 'jogo_memoria',
      jogo_da_memoria: 'jogo_memoria',
      verdadeirofalso: 'verdadeiro_falso',
      vf: 'verdadeiro_falso',
      multipla_escolha: 'escolha',
      multiplaescolha: 'escolha',
      quiz: 'escolha',
      arrastar_passos: 'ordenar_passos',
      ordenar: 'ordenar_passos',
      montafrase: 'monta_frase',
      monta_frase: 'monta_frase',
      palavras_perdidas: 'completar',
      complete: 'completar'
    };
    return aliases[tipo] || tipo || 'verdadeiro_falso';
  }

  function chaveUnicaMinigame(tipo) {
    const norm = normalizarTipoMinigame(tipo);
    if (norm === 'palavras_perdidas' || norm === 'completar') return 'completar';
    if (norm === 'monta_frase') return 'monta_frase';
    if (norm === 'memoria' || norm === 'jogo_memoria') return 'jogo_memoria';
    return norm;
  }

  function montarListaMinigamesUnica(tipos, genero, faixa) {
    const vistos = new Set();
    const lista = [];
    (tipos || []).forEach((t) => {
      const norm = normalizarTipoMinigame(t);
      const chave = chaveUnicaMinigame(norm);
      if (vistos.has(chave)) return;
      vistos.add(chave);
      lista.push(norm);
    });
    const extras = escolherMinigamesTipos(faixa, genero);
    for (let i = 0; i < extras.length && lista.length < 4; i++) {
      const norm = normalizarTipoMinigame(extras[i]);
      const chave = chaveUnicaMinigame(norm);
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      lista.push(norm);
    }
    return lista.slice(0, 4);
  }

  function extrairPalavrasLista(valor) {
    if (valor == null) return [];
    if (Array.isArray(valor)) {
      return valor.flatMap((item) => extrairPalavrasLista(item));
    }
    const texto = String(valor).trim();
    if (!texto) return [];
    if (texto.startsWith('[')) {
      try {
        const parsed = JSON.parse(texto);
        if (Array.isArray(parsed)) return extrairPalavrasLista(parsed);
      } catch (_) {}
    }
    return texto.split(/\s+/).filter(Boolean);
  }

  function extrairDadosMontaFrase(spec) {
    const fonte = spec && typeof spec === 'object' ? spec : {};
    const fraseCorreta = String(
      fonte.resposta != null ? fonte.resposta
        : (fonte.frase_correta != null ? fonte.frase_correta
          : (fonte.frase != null ? fonte.frase : ''))
    ).trim();
    let palavrasCorretas = extrairPalavrasLista(fraseCorreta);
    let palavrasPool = extrairPalavrasLista(fonte.palavras);
    if (!palavrasCorretas.length && palavrasPool.length) palavrasCorretas = [...palavrasPool];
    if (!palavrasPool.length && palavrasCorretas.length) palavrasPool = [...palavrasCorretas];
    const norm = (s) => String(s || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    palavrasCorretas.forEach((w) => {
      if (!palavrasPool.some((p) => norm(p) === norm(w))) palavrasPool.push(w);
    });
    return {
      pergunta: fonte.pergunta || '🧩 Monte a frase com as palavras abaixo.',
      palavrasCorretas,
      palavrasPool: palavrasPool.filter(Boolean)
    };
  }

  function normalizarCorreta(valor) {
    if (typeof valor === 'boolean') return valor ? 0 : 1;
    if (typeof valor === 'number' && Number.isFinite(valor)) return valor;
    const texto = String(valor || '').trim().toLowerCase();
    if (texto === 'verdadeiro' || texto === 'v' || texto === 'true') return 0;
    if (texto === 'falso' || texto === 'f' || texto === 'false') return 1;
    return 0;
  }

  function normalizarMinigamePreset(minigame) {
    if (!minigame || typeof minigame !== 'object') return null;
    const tipo = normalizarTipoMinigame(minigame.tipo || minigame.Tipo);
    const pergunta = minigame.pergunta || minigame.Pergunta || '';
    const dados = (minigame.dados && typeof minigame.dados === 'object')
      ? minigame.dados
      : (minigame.Dados && typeof minigame.Dados === 'object' ? minigame.Dados : {});
    const fonte = { ...minigame, ...dados };
    const base = { tipo, pergunta };

    if (tipo === 'escolha') {
      base.opcoes = Array.isArray(fonte.opcoes) ? fonte.opcoes.map(String) : [];
      base.correta = normalizarCorreta(fonte.correta);
    } else if (tipo === 'completar' || tipo === 'palavras_perdidas') {
      base.resposta = String(
        fonte.resposta != null ? fonte.resposta
          : (fonte.palavra != null ? fonte.palavra
            : (fonte.lacuna != null ? fonte.lacuna
              : (fonte.correta != null ? fonte.correta : '')))
      ).trim();
      const fraseRaw = fonte.frase || fonte.texto || '';
      base.frase = String(fraseRaw).trim();
      if (fonte.dica != null) base.dica = String(fonte.dica);
    } else if (tipo === 'monta_frase' || tipo === 'palavras_perdidas') {
      const mf = extrairDadosMontaFrase(fonte);
      base.resposta = mf.palavrasCorretas.join(' ');
      base.frase_correta = base.resposta;
      base.palavras = mf.palavrasPool;
      if (pergunta) base.pergunta = pergunta;
    } else if (tipo === 'verdadeiro_falso') {
      base.afirmacao = String(fonte.afirmacao || pergunta || '');
      base.opcoes = Array.isArray(fonte.opcoes) ? fonte.opcoes.map(String) : ['Verdadeiro', 'Falso'];
      base.correta = normalizarCorreta(fonte.correta);
      if (fonte.justificativa != null) base.justificativa = String(fonte.justificativa);
    } else if (tipo === 'jogo_memoria') {
      base.pares = enriquecerParesMemoria(fonte.pares);
    } else if (tipo === 'som_palavra') {
      base.alvo = fonte.alvo != null ? String(fonte.alvo) : '';
      base.opcoes = Array.isArray(fonte.opcoes) ? fonte.opcoes.map(String) : [];
    } else if (tipo === 'rima') {
      base.palavra = fonte.palavra != null ? String(fonte.palavra) : '';
      base.rima = fonte.rima != null ? String(fonte.rima) : '';
      base.opcoes = Array.isArray(fonte.opcoes) ? fonte.opcoes.map(String) : [];
    } else if (tipo === 'quem_disse') {
      base.fala = String(fonte.fala || fonte.trecho || '');
      base.opcoes = Array.isArray(fonte.opcoes) ? fonte.opcoes.map(String) : [];
      base.correta = normalizarCorreta(fonte.correta);
    } else if (tipo === 'ordenar_passos') {
      base.passos = Array.isArray(fonte.passos) ? fonte.passos.map(String) : [];
    } else if (tipo === 'colorir') {
      base.palavrasAlvo = Array.isArray(fonte.palavrasAlvo) ? fonte.palavrasAlvo.map(String) : [];
      base.distratoras = Array.isArray(fonte.distratoras) ? fonte.distratoras.map(String) : [];
    }

    return base;
  }

  function extrairJsonTextoGroq(rawText) {
    const limpo = String(rawText || '').replace(/```json|```/gi, '').trim();
    if (!limpo) return '{}';
    const ini = limpo.indexOf('{');
    const fim = limpo.lastIndexOf('}');
    if (ini >= 0 && fim > ini) return limpo.slice(ini, fim + 1);
    return limpo;
  }

  function garantirMinigamesGroq(minigames, genero, faixa) {
    const lista = Array.isArray(minigames) ? minigames.map(normalizarMinigamePreset).filter(Boolean) : [];
    const tipos = montarListaMinigamesUnica(lista.map((m) => m.tipo), faixa, genero);
    const porChave = {};
    lista.forEach((m) => { porChave[chaveUnicaMinigame(m.tipo)] = m; });
    return tipos.map((tipo) => porChave[chaveUnicaMinigame(tipo)] || { tipo, pergunta: '' });
  }

  function normalizarStoryGroq(storyRaw, faixaSelecionada, generoSelecionado) {
    const story = (storyRaw && typeof storyRaw === 'object') ? storyRaw : {};
    const generoNormalizado = ['narrativo', 'poetico', 'instrucional', 'descritivo', 'informativo']
      .includes(String(story.genero || '').toLowerCase())
      ? String(story.genero).toLowerCase()
      : generoSelecionado;

    const minigames = garantirMinigamesGroq(story.minigames || story.Minigames, generoNormalizado, faixaSelecionada);
    const texto = String(story.texto || '').trim();
    const titulo = String(story.titulo || '').trim();
    if (!titulo || !texto) {
      throw new Error('A Groq não retornou os campos obrigatórios da história (titulo/texto).');
    }
    if (!minigames.length) {
      throw new Error('A Groq não retornou minigames válidos.');
    }

    return {
      ...story,
      titulo,
      texto,
      genero: generoNormalizado,
      faixaEtaria: faixaSelecionada,
      minigames
    };
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

  function mapMinigameGroqParaApi(minigame) {
    if (!minigame || typeof minigame !== 'object') return null;
    const tipo = minigame.tipo || minigame.Tipo;
    if (!tipo) return null;
    const pergunta = minigame.pergunta || minigame.Pergunta || '';
    const dados = {};
    Object.keys(minigame).forEach((chave) => {
      const k = chave.toLowerCase();
      if (k === 'tipo' || k === 'pergunta') return;
      dados[chave] = minigame[chave];
    });
    return { tipo: String(tipo), pergunta: String(pergunta), dados };
  }

  function montarBodySalvarHistoriaGroq(story, criancaId, prompt, modelo) {
    const minigames = (story.minigames || story.Minigames || [])
      .map(mapMinigameGroqParaApi)
      .filter(Boolean);
    return {
      criancaId,
      promptCrianca: prompt,
      modelo: modelo || 'llama-3.3-70b-versatile',
      story: {
        titulo: story.titulo,
        genero: story.genero,
        faixaEtaria: story.faixaEtaria,
        duracao: story.duracao || '6 min',
        emoji: story.emoji || '📖',
        cena: story.cena || '🌟',
        texto: story.texto,
        palavrasChave: Array.isArray(story.palavrasChave) ? story.palavrasChave : [],
        minigames
      }
    };
  }

  function mapStoryDetailToLegacy(story, serverId) {
    const minigamesRaw = Array.isArray(story?.minigames)
      ? story.minigames
      : (Array.isArray(story?.Minigames) ? story.Minigames : []);
    const minigamesPreset = minigamesRaw.map(normalizarMinigamePreset).filter(Boolean);
    const idApi = serverId != null ? `api-${serverId}` : `ia-bot-${Date.now()}`;

    return {
      id: idApi,
      genero: story?.genero || 'narrativo',
      faixa: story?.faixaEtaria || 1,
      titulo: story?.titulo || 'História criada pela IA',
      emoji: story?.emoji || '📖',
      cena: story?.cena || '🌟',
      duracao: story?.duracao || '6 min',
      fases: [
        {
          texto: story?.texto || 'Era uma vez...',
          cena: story?.cena || '🌟',
          interacao: {
            tipo: 'escolha',
            pergunta: 'Pronto para jogar os minigames?',
            opcoes: ['Sim, vamos!', 'Depois'],
            correta: 0
          }
        }
      ],
      palavrasChave: Array.isArray(story?.palavrasChave) ? story.palavrasChave : [],
      minigamesPreset
    };
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
        } catch (_) {}
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

      const vinculo = obterVinculoCrianca();
      if (!vinculo?.criancaId) {
        throw new Error('Vincule o perfil da criança ao responsável para salvar histórias da IA.');
      }

      const salva = await apiPost(
        '/api/v1/stories/save',
        montarBodySalvarHistoriaGroq(story, vinculo.criancaId, prompt, 'llama-3.3-70b-versatile')
      );
      promptEl.value = '';

      const historiaCompleta = mapStoryDetailToLegacy(
        { ...story, ...salva, faixaEtaria: faixaSelecionada, genero: generoSelecionado },
        salva.id
      );
      garantirHistoriaNaBiblioteca(historiaCompleta);
      await carregarHistoriasDaApi();
      preservarDetalheHistoriaNaBiblioteca(historiaCompleta.id, historiaCompleta);
      renderizarBiblioteca();

      await iniciarHistoria(historiaCompleta.id, { irLeitura: true });
      mostrarToast('História criada! Boa leitura 📖');
    } catch (e) {
      if (errEl) {
        errEl.textContent = (e && e.message) || 'Não foi possível gerar a história agora.';
        errEl.classList.remove('oculto');
      }
    } finally {
      btn.disabled = false;
    }
  }

  async function enviarSyncProgresso() {
    const sessao = (() => {
      try { return JSON.parse(localStorage.getItem('mundoHistorias_responsavel_sessao') || 'null'); } catch (_) { return null; }
    })();
    const vinculo = obterVinculoCrianca();
    if (!sessao?.responsavelId || !vinculo?.criancaId) return;
  
    await apiPost('/api/v1/sync/progress', {
      responsavelId: sessao.responsavelId,
      criancaId: vinculo.criancaId,
      faixaEtaria: estado.perfil.faixa,
      progressoHistorias: {
        totalEstrelas: estado.totalEstrelas,
        historiasLidas: estado.historiasLidas,
        tempoTotal: estado.tempoTotal
      },
      resumoMinigames: {
        minigamesJogados: estado.minigamesJogados,
        tentativasReprovadas: estado.tentativasReprovadas
      },
      updatedAt: new Date().toISOString()
    });
  }
   
   // =============================================
   // 4. ACESSIBILIDADE
   // =============================================
   
  let tamanhoFonte = 16;
  let altoContraste = false;
  const CHAVE_MODO_NOTURNO = 'mundoHistorias_modoNoturno';
   
   function ajustarFonte(delta) {
     tamanhoFonte = Math.min(26, Math.max(12, tamanhoFonte + delta));
     // Aplica no <html> para que rem/em de TODOS os elementos herdem corretamente
     document.documentElement.style.fontSize = tamanhoFonte + 'px';
     document.documentElement.style.setProperty('--fonte-base', tamanhoFonte + 'px');
     //mostrarToast(delta > 0 ? `Fonte: ${tamanhoFonte}px 🔠` : `Fonte: ${tamanhoFonte}px 🔡`);
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
   
   let ttsAtivo = false;
   let ttsUtterance = null;
   
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
   // Remove HTML tags
   const textoLimpo = texto.replace(/<[^>]*>/g, '');
    ttsUtterance = new SpeechSynthesisUtterance(textoLimpo);
    ttsUtterance.lang = 'pt-BR';
    ttsUtterance.rate = 0.85;
    //define
    ttsUtterance.pitch = 1.1;
    ttsAtivo = true;
    document.querySelectorAll('#btn-ouvir, #btn-ouvir-mg, #btn-ouvir-resumo').forEach(b => b.classList.add('ativo'));
    ttsUtterance.onend = () => {
      ttsAtivo = false;
      document.querySelectorAll('#btn-ouvir, #btn-ouvir-mg, #btn-ouvir-resumo').forEach(b => b.classList.remove('ativo'));
     };
     window.speechSynthesis.speak(ttsUtterance);
   }
   
   // =============================================
   // 5. TOAST
   // =============================================
   // toast é uma mensagem temporária que aparece na tela para informar o usuário sobre algo, como um feedback de ação ou uma notificação. A função "mostrarToast" cria um contêiner para os toasts se ele ainda não existir, e então adiciona um novo toast com a mensagem fornecida. O toast é removido automaticamente após 3 segundos.
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
   
   // =============================================
   // 6. NAVEGAÇÃO
   // =============================================
   
   function irParaTela(nomeTela) {
     document.querySelectorAll('.tela-app').forEach(t => t.classList.remove('ativa'));
     const alvo = document.getElementById('tela-' + nomeTela);
     if (alvo) alvo.classList.add('ativa');
   
     // Sincroniza apenas sidebar (sem nav bottom)
     document.querySelectorAll('.nav-item').forEach(b => {
       const ativo = b.dataset.tela === nomeTela;
       b.classList.toggle('ativo', ativo);
       b.setAttribute('aria-current', ativo ? 'page' : 'false');
     });
   
     // Rola para o topo
     const main = document.getElementById('app-main');
     if (main) main.scrollTop = 0;
   
     // Atualiza tela específica
     if (nomeTela === 'progresso') atualizarTelaProgresso();
   }
   
   // (Lógica de login movida para login.js)
   
   // =============================================
   // 8. HEADER
   // =============================================
   
   function atualizarHeader() {
     document.getElementById('avatar-display').textContent = estado.perfil.avatar;
     document.getElementById('header-nome').textContent = estado.perfil.nome;
     document.getElementById('header-nivel').textContent = labelNivel(estado.nivel);
     document.getElementById('total-estrelas').textContent = estado.totalEstrelas;
   }
   
   function labelNivel(n) {
     return { iniciante: '🌱 Iniciante', intermediario: '🌿 Intermediário', avancado: '🌳 Avançado' }[n] || '🌱 Iniciante';
   }

   const FAIXAS_NIVEL_XP = [
     { id: 'iniciante', min: 0, max: 100 },
     { id: 'intermediario', min: 100, max: 280 },
     { id: 'avancado', min: 280, max: 450 }
   ];

   function calcularNivelPorXp(xp) {
     const x = Math.max(0, Number(xp) || 0);
     if (x >= 280) return 'avancado';
     if (x >= 100) return 'intermediario';
     return 'iniciante';
   }

   function obterFaixaXpAtual(xp) {
     const nivel = calcularNivelPorXp(xp);
     return FAIXAS_NIVEL_XP.find((f) => f.id === nivel) || FAIXAS_NIVEL_XP[0];
   }

   function adicionarExperiencia(quantidade, motivo) {
     const ganho = Math.max(0, Number(quantidade) || 0);
     if (!ganho) return;
     const antes = estado.experiencia || 0;
     const nivelAntes = calcularNivelPorXp(antes);
     estado.experiencia = antes + ganho;
     const nivelDepois = calcularNivelPorXp(estado.experiencia);
     estado.nivel = nivelDepois;
     salvarEstado();
     atualizarHeader();
     atualizarBarraExperiencia();
     if (nivelDepois !== nivelAntes) {
       const labels = { intermediario: 'Intermediário 🌿', avancado: 'Avançado 🌳' };
       mostrarToast(`Você subiu de nível! Agora é ${labels[nivelDepois] || nivelDepois} ✨`);
     }
   }

   function atualizarBarraExperiencia() {
     const xp = estado.experiencia || 0;
     const faixa = obterFaixaXpAtual(xp);
     const noNivel = xp - faixa.min;
     const tamanhoFaixa = faixa.max - faixa.min;
     const pct = Math.min(100, Math.round((noNivel / tamanhoFaixa) * 100));
     const fill = document.getElementById('xp-barra-fill');
     const texto = document.getElementById('xp-texto');
     const label = document.getElementById('xp-nivel-label');
     const proxLabel = document.getElementById('xp-proximo-label');
     if (fill) fill.style.width = pct + '%';
     if (texto) texto.textContent = `${xp} XP · ${noNivel} / ${tamanhoFaixa} neste nível`;
     if (label) label.textContent = labelNivel(estado.nivel);
     if (proxLabel) {
       if (faixa.id === 'avancado') {
         proxLabel.textContent = xp >= faixa.max ? 'Nível máximo alcançado! 🏆' : `Faltam ${faixa.max - xp} XP para dominar tudo`;
       } else {
         const prox = faixa.id === 'iniciante' ? 'Intermediário' : 'Avançado';
         proxLabel.textContent = `Faltam ${faixa.max - xp} XP para ${prox}`;
       }
     }
     ['iniciante', 'intermediario', 'avancado'].forEach((n) => {
       const el = document.getElementById('ns-' + n);
       if (el) el.classList.toggle('ativo', niveisOrdem(estado.nivel) >= niveisOrdem(n));
     });
   }

   function textoValidoCompletar(texto) {
     const t = String(texto || '').trim();
     if (!t) return false;
     if (/^[-–—_\s.]+$/u.test(t)) return false;
     if (/^complete(\s+a\s+frase)?[:.]?\s*$/i.test(t)) return false;
     return true;
   }

   function limparTextoCompletar(texto) {
     return String(texto || '')
       .replace(/^✍️\s*/u, '')
       .replace(/^Complete:\s*/i, '')
       .replace(/^Complete a frase[^:]*:\s*/i, '')
       .replace(/\s*[-–—]{2,}\s*/g, ' ')
       .replace(/\s+/g, ' ')
       .trim();
   }

   function montarDadosCompletarMG(fase, h, spec) {
     const fonte = spec && typeof spec === 'object' ? spec : {};
     let resposta = String(
       fonte.resposta != null ? fonte.resposta
         : (fonte.palavra != null ? fonte.palavra
           : (fonte.lacuna != null ? fonte.lacuna : ''))
     ).trim();
     let frase = '';
     if (textoValidoCompletar(fonte.frase)) frase = limparTextoCompletar(fonte.frase);
     else if (textoValidoCompletar(fonte.texto)) frase = limparTextoCompletar(fonte.texto);

     const inter = fase && fase.interacao && fase.interacao.tipo === 'completar' ? fase.interacao : null;
     if (!resposta && inter) resposta = String(inter.resposta || '').trim();
     if (!frase && inter && textoValidoCompletar(inter.pergunta)) {
       frase = limparTextoCompletar(inter.pergunta);
     }

     if (!resposta && h) {
       const kw = (h.palavrasChave || []).find(Boolean) || 'história';
       resposta = kw;
       const textoLimpo = (fase && fase.texto ? fase.texto : h.fases[0]?.texto || '')
         .replace(/<[^>]+>/g, '')
         .replace(/\s+/g, ' ')
         .trim();
       const fraseTxt = textoLimpo.split(/[.!?]/).map((s) => s.trim()).find((s) => s.length > 12) || textoLimpo;
       const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
       if (re.test(fraseTxt)) frase = fraseTxt.replace(re, '___');
       else frase = (fraseTxt.length > 80 ? fraseTxt.slice(0, 80) + '…' : fraseTxt) + ' ___';
     }

     if (frase && resposta && !/_{2,}|___/.test(frase)) {
       const reResp = new RegExp(`\\b${resposta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
       if (reResp.test(frase)) frase = frase.replace(reResp, '___');
       else frase = frase + ' ___';
     }

     if (!frase) frase = 'Complete a frase ___';

     let instrucao = 'Leia a frase e escreva uma palavra para completar.';
     const perguntaSpec = limparTextoCompletar(fonte.pergunta || '');
     if (textoValidoCompletar(perguntaSpec) && !/_{2,}|___/.test(perguntaSpec) && perguntaSpec !== frase) {
       instrucao = perguntaSpec;
     }

     return {
       frase,
       instrucao,
       resposta: resposta || 'palavra',
       dica: fonte.dica || (inter && inter.dica) || ''
     };
   }

   function formatarFraseLacunaHtml(frase) {
     const limpa = limparTextoCompletar(String(frase || '').replace(/<[^>]+>/g, ''));
     return limpa.replace(/_{2,}|___/g, '<span class="lacuna-vazia" aria-hidden="true">_____</span>');
   }
   
   // =============================================
   // 9. BIBLIOTECA
   // =============================================
   
   function renderizarBiblioteca() {
     const grid = document.getElementById('historias-grid');
     grid.innerHTML = '';
    const faixaPerfil = parseInt(estado?.perfil?.faixa, 10) || 1;
   
     let lista = HISTORIAS.filter(h => {
       const okGenero = estado.filtroGenero === 'todos' || h.genero === estado.filtroGenero;
      const okFaixaPerfil = parseInt(h.faixa, 10) === faixaPerfil;
      const okFaixaFiltro = estado.filtroFaixa === 'todos' || parseInt(h.faixa, 10) === parseInt(estado.filtroFaixa, 10);
      return okGenero && okFaixaPerfil && okFaixaFiltro;
     });
   
     if (lista.length === 0) {
       grid.innerHTML = '<p class="vazio-msg" style="grid-column:1/-1">Nenhuma história encontrada com esses filtros. Tente outros! 🔍</p>';
       return;
     }
   
     lista.forEach((h, i) => {
       const concluida = estado.historiasLidas.find(r => r.id === h.id);
       const estrelas = concluida ? concluida.estrelas : 0;
       const card = document.createElement('div');
       card.className = 'historia-card';
       card.style.animationDelay = (i * 0.05) + 's';
       card.setAttribute('tabindex', '0');
       card.setAttribute('role', 'button');
       card.setAttribute('aria-label', `${h.titulo}, gênero ${h.genero}, faixa ${h.faixa}`);
   
       card.innerHTML = `
         <div class="hc-emoji">${h.emoji}</div>
         <div class="hc-titulo">${h.titulo}</div>
         <div class="hc-tags">
           <span class="hc-tag genero">${labelGenero(h.genero)}</span>
           <span class="hc-tag faixa">${labelFaixa(h.faixa)}</span>
           <span class="hc-tag duracao">⏱ ${h.duracao}</span>
           ${concluida ? `<span class="hc-tag concluida">✅ Concluída</span>` : ''}
         </div>
         <div class="hc-rodape">
           <span class="hc-estrelas">${renderEstrelas(estrelas, 3)}</span>
           <button class="hc-jogar" aria-label="Jogar ${h.titulo}">Jogar 🎮</button>
         </div>
       `;
   
       const jogar = card.querySelector('.hc-jogar');
       jogar.addEventListener('click', (e) => { e.stopPropagation(); iniciarHistoria(h.id); });
       card.addEventListener('click', () => iniciarHistoria(h.id));
       card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') iniciarHistoria(h.id); });
   
       grid.appendChild(card);
     });
   }
   
   function labelGenero(g) {
     const m = { narrativo:'📖 Narrativo', poetico:'🎵 Poético', instrucional:'📋 Instrucional', descritivo:'🔍 Descritivo', informativo:'💡 Informativo' };
     return m[g] || g;
   }
   function labelFaixa(f) {
     return { 1:'5–6 anos', 2:'7–8 anos', 3:'9–10 anos' }[f] || '';
   }
   function calcularEstrelasPorAcertos(acertos, total) {
     const a = Math.max(0, Number(acertos) || 0);
     const t = Math.max(1, Number(total) || 1);
     if (a >= t) return 3;
     if (a >= Math.ceil(t * 0.5)) return 2;
     if (a >= 1) return 1;
     return 0;
   }

   function registrarEstrelasHistoria(estrelasNovas) {
     const id = estado.historiaAtual && estado.historiaAtual.id;
     if (!id) return;
     const novas = Math.max(0, Math.min(3, Number(estrelasNovas) || 0));
     const idx = estado.historiasLidas.findIndex(r => r.id === id);
     if (idx >= 0) {
       const antigas = Number(estado.historiasLidas[idx].estrelas) || 0;
       if (novas > antigas) {
         estado.totalEstrelas += novas - antigas;
         estado.historiasLidas[idx].estrelas = novas;
         salvarEstado();
         atualizarHeader();
         renderizarBiblioteca();
       }
     } else if (novas > 0) {
       estado.historiasLidas.push({
         id,
         estrelas: novas,
         data: new Date().toLocaleDateString('pt-BR')
       });
       estado.totalEstrelas += novas;
       salvarEstado();
       atualizarHeader();
       renderizarBiblioteca();
     }
   }

   function atualizarEstrelasAposMinigame() {
     if (!estado.historiaAtual) return;
     const total = estado.minigamesLista.length || 4;
     const acertos = (estado.acertos || 0) + (estado.mgAcertos || 0);
     registrarEstrelasHistoria(calcularEstrelasPorAcertos(acertos, total));
   }

   function renderEstrelas(ganhas, total = 3) {
     const n = Math.max(0, Math.min(total, Number(ganhas) || 0));
     let html = `<span class="estrelas-rating" aria-label="${n} de ${total} estrelas">`;
     for (let i = 0; i < total; i++) {
       html += `<span class="estrela-icon ${i < n ? 'estrela-preenchida' : 'estrela-vazia'}" aria-hidden="true">★</span>`;
     }
     return html + '</span>';
   }

   function revelarMontaFraseCorreta(palavrasCorretas) {
     const espaco = document.getElementById('mfEspaco');
     const pool = document.getElementById('mfPool');
     if (espaco) {
       espaco.innerHTML = palavrasCorretas.map(p =>
         `<span class="mf-colocada mf-resposta-correta">${p}</span>`
       ).join(' ');
     }
     if (pool) pool.querySelectorAll('.mf-chip, .mf-colocada').forEach(b => { b.disabled = true; });
   }
   
   function inicializarFiltros() {
     // Filtro gênero
     document.querySelectorAll('#filtro-genero .chip').forEach(btn => {
       btn.addEventListener('click', () => {
         document.querySelectorAll('#filtro-genero .chip').forEach(b => b.classList.remove('ativo'));
         btn.classList.add('ativo');
         estado.filtroGenero = btn.dataset.filtroGenero;
         renderizarBiblioteca();
       });
     });
     // Filtro faixa
     document.querySelectorAll('#filtro-faixa .chip').forEach(btn => {
       btn.addEventListener('click', () => {
         document.querySelectorAll('#filtro-faixa .chip').forEach(b => b.classList.remove('ativo'));
         btn.classList.add('ativo');
         estado.filtroFaixa = btn.dataset.filtroFaixa;
         renderizarBiblioteca();
       });
     });
   }

  function aplicarFaixaDoPerfilNosFiltros() {
    const faixaPerfil = String(parseInt(estado?.perfil?.faixa, 10) || 1);
    estado.filtroFaixa = faixaPerfil;

    const chipsFaixa = document.querySelectorAll('#filtro-faixa .chip');
    chipsFaixa.forEach(btn => {
      const ehFaixaPerfil = btn.dataset.filtroFaixa === faixaPerfil;
      btn.classList.toggle('ativo', ehFaixaPerfil);
      btn.disabled = !ehFaixaPerfil;
      btn.setAttribute('aria-disabled', String(!ehFaixaPerfil));
      if (!ehFaixaPerfil) {
        btn.classList.add('desabilitado');
      } else {
        btn.classList.remove('desabilitado');
      }
    });
  }
   
   // =============================================
   // 10. LEITURA — Fluxo de fases
   // =============================================
   
  async function iniciarHistoria(id, opcoes) {
    let historia = HISTORIAS.find((h) => h.id === id);

    if (String(id).startsWith('api-')) {
      try {
        const detalhe = await carregarDetalheHistoriaDaApi(id);
        if (detalhe) {
          historia = detalhe;
          preservarDetalheHistoriaNaBiblioteca(id, detalhe);
        }
      } catch (_) {}
    }

    if (!historia) return;

    estado.historiaAtual = historia;
    estado.faseAtual = 0;
    estado.acertos = 0;
    estado.ajudas = 0;
    estado.iniciouEm = Date.now();

    if (opcoes && opcoes.irLeitura) {
      prepararMinigamesPreset(historia);
      irParaTela('leitura');
      renderizarFase();
      return;
    }

    estado.minigamesPreset = null;
    iniciarMinigames();
  }
   
   function obterTextoCompletoHistoria(h) {
     if (!h || !Array.isArray(h.fases)) return '';
     return h.fases.map((f) => f.texto || '').filter(Boolean).join(' ');
   }

   function lerTextoCompletoHistoria(opcoes) {
     const opts = opcoes || {};
     const h = estado.historiaAtual;
     if (!h) {
       mostrarToast('Escolha uma história primeiro! 📚');
       return;
     }
     const textoCompleto = obterTextoCompletoHistoria(h);
     if (!textoCompleto.trim()) {
       mostrarToast('Esta história ainda não tem texto para ler.');
       return;
     }

     irParaTela('leitura');
     setUiLeituraModoCompleto(true);
     document.getElementById('leitura-titulo-badge').textContent = h.titulo;
     document.getElementById('fase-atual-label').textContent = 'História completa';
     document.getElementById('historia-emoji-cena').textContent = h.cena || (h.fases[0] && h.fases[0].cena) || '';

     const textoEl = document.getElementById('historia-texto');
     textoEl.innerHTML = textoCompleto;
     textoEl.classList.toggle('sem-destaque', !estado.destaqueAtivo);
     textoEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

     ocultarFeedback();

     if (opts.somenteExibir) return;

     if (opts.autoOuvir || estado.perfil.faixa === 1) {
       setTimeout(() => ouvirTexto(textoCompleto), opts.autoOuvir ? 400 : 800);
     }
   }

   function setUiLeituraModoCompleto(completo) {
     estado.modoLeituraCompleta = completo;
     const faseInd = document.querySelector('.fase-indicador');
     const barra = document.querySelector('.barra-progresso-fases');
     const inter = document.getElementById('interacao-area');
     const btnPular = document.getElementById('btn-pular-fase');
     if (faseInd) faseInd.style.display = completo ? 'none' : '';
     if (barra) barra.style.display = completo ? 'none' : '';
     if (inter) inter.style.display = completo ? 'none' : '';
     if (btnPular) btnPular.style.display = completo ? 'none' : '';
   }

   function mostrarLeituraCompleta() {
     const h = estado.historiaAtual;
     if (!h) return;
     lerTextoCompletoHistoria({ autoOuvir: estado.perfil.faixa === 1 });

     const n = estado.minigamesLista.length;
     const btn = document.getElementById('btn-continuar');
     btn.textContent = `Vamos Jogar! 🚀 (${n} minigame${n > 1 ? 's' : ''})`;
     btn.style.display = 'block';
   }

   function renderizarFase() {
     const h = estado.historiaAtual;
     const fi = estado.faseAtual;
     const fase = h.fases[fi];
     const totalFases = h.fases.length;

     setUiLeituraModoCompleto(false);
   
     // Título e badge
     document.getElementById('leitura-titulo-badge').textContent = h.titulo;
     document.getElementById('fase-atual-label').textContent = `Fase ${fi + 1}`;
   
     //fase dots é aquela barra de progresso que mostra quantas fases tem a história e em qual fase o usuário está. 
     // Dots
     const dots = document.getElementById('fase-dots');
     dots.innerHTML = '';
     for (let i = 0; i < totalFases; i++) {
       const d = document.createElement('div');
       d.className = 'fase-dot ' + (i < fi ? 'concluida' : i === fi ? 'atual' : '');
       dots.appendChild(d);
     }
   
     // Barra
     const pct = ((fi) / totalFases * 100);
     document.getElementById('barra-fase-fill').style.width = pct + '%';
   
     // Cena
     document.getElementById('historia-emoji-cena').textContent = fase.cena || h.cena;
   
     // Texto
     const textoEl = document.getElementById('historia-texto');
     textoEl.innerHTML = fase.texto;
     textoEl.classList.toggle('sem-destaque', !estado.destaqueAtivo);
   
     // Interação
     renderizarInteracao(fase.interacao);
   
     // Ocultar feedback e continuar
     ocultarFeedback();
     document.getElementById('btn-continuar').style.display = 'none';
   
     // TTS — lê automaticamente para faixa 1
     if (estado.perfil.faixa === 1) {
       setTimeout(() => ouvirTexto(fase.texto), 800);
     }
   }
   //inter é o objeto que define a interação da fase, que pode ser do tipo "escolha" ou "completar". A função "renderizarInteracao" é responsável por criar os elementos HTML correspondentes a cada tipo de interação e adicionar os event listeners para lidar com as respostas do usuário. Para o tipo "escolha", são criados botões para cada opção, e para o tipo "completar", é criado um campo de texto e um botão de confirmação. As respostas são processadas pelas funções "responderEscolha" e "responderCompletarFeedback", que verificam se a resposta está correta, atualizam o estado de acertos e ajudas, e exibem o feedback correspondente.
   function renderizarInteracao(inter) {
     const area = document.getElementById('interacao-area');
     area.innerHTML = '';
   
     if (!inter) return;
   
     const div = document.createElement('div');
   
     if (inter.tipo === 'escolha') {
       div.innerHTML = `
         <p class="interacao-pergunta">${inter.pergunta}</p>
         <div class="interacao-opcoes" id="opcoes-container">
           ${inter.opcoes.map((op, i) => `
             <button class="opcao-btn" data-idx="${i}" aria-label="${op}">${op}</button>
           `).join('')}
         </div>
       `;
       area.appendChild(div);
       div.querySelectorAll('.opcao-btn').forEach(btn => {
         btn.addEventListener('click', () => responderEscolha(parseInt(btn.dataset.idx), inter.correta, div));
       });
   
     } else if (inter.tipo === 'completar') {
       div.innerHTML = `
         <p class="interacao-pergunta">${inter.pergunta}</p>
         <div class="interacao-input-area">
           <input type="text" class="interacao-input" id="input-completar" placeholder="Digite aqui..." autocomplete="off" aria-label="Resposta" />
           <button class="btn-confirmar" id="btn-conf-completar">✓ OK</button>
         </div>
       `;
       area.appendChild(div);
       const inp = document.getElementById('input-completar');
       const conf = document.getElementById('btn-conf-completar');
       const normalizar = str =>
  str.trim().toLowerCase()
    .normalize('NFD')                    // separa letra base do acento: "á" → "a" + "◌́"
    .replace(/[\u0300-\u036f]/g, '');    // remove só os acentos, fica "a"

const verificar = () => {
  const v = normalizar(inp.value);
  const c = normalizar(inter.resposta);
  const ok = v === c || v.includes(c) || c.includes(v);
  responderCompletarFeedback(ok, c, inp, conf);
};
       conf.addEventListener('click', verificar);
       inp.addEventListener('keydown', e => { if (e.key === 'Enter') verificar(); });
     }
   }
   
   function responderEscolha(idx, correta, container) {
     const btns = container.querySelectorAll('.opcao-btn');
     btns.forEach(b => b.disabled = true);
     const ok = idx === correta;
     btns[idx].classList.add(ok ? 'correta' : 'errada');
    if (!ok) { btns[correta].classList.add('correta'); estado.ajudas++; estado.tentativasReprovadas++; }
     else estado.acertos++;
     adicionarExperiencia(12, 'fase');
     mostrarFeedbackFase(ok);
   }
   
   function responderCompletarFeedback(ok, correta, inp, btn) {
     inp.disabled = true; btn.disabled = true;
     inp.classList.add(ok ? 'correta' : 'errada');
     if (!ok) {
       inp.value = correta;
       inp.classList.remove('errada');
       inp.classList.add('correta');
       estado.ajudas++;
      estado.tentativasReprovadas++;
     } else {
       estado.acertos++;
     }
     adicionarExperiencia(12, 'fase');
     mostrarFeedbackFase(ok);
   }
   
   function mostrarFeedbackFase(ok) {
     const area = document.getElementById('feedback-area');
     const card = document.getElementById('feedback-card');
     const emoji = document.getElementById('feedback-emoji');
     const msg   = document.getElementById('feedback-msg');
   
     area.classList.remove('oculto');
     if (ok) {
       card.style.background = 'linear-gradient(135deg,#DCFCE7,#D1FAE5)';
       card.style.borderColor = 'var(--cor-verde)';
       emoji.textContent = ['🎉','⭐','🌟','🚀','💫'][Math.floor(Math.random()*5)];
       msg.textContent = MSGS_ACERTO[Math.floor(Math.random()*MSGS_ACERTO.length)];
       msg.style.color = '#166534';
     } else {
       card.style.background = 'linear-gradient(135deg,#FEF3C7,#FDE68A)';
       card.style.borderColor = '#F59E0B';
       emoji.textContent = '💛';
       msg.textContent = MSGS_ERRO[Math.floor(Math.random()*MSGS_ERRO.length)];
       msg.style.color = '#92400E';
     }
   
     // Exibir botão continuar
     const btn = document.getElementById('btn-continuar');
     const isUltima = estado.faseAtual >= estado.historiaAtual.fases.length - 1;
     btn.textContent = isUltima ? 'Próxima Fase 🚀' : 'Próxima Fase 🚀';
     btn.style.display = 'block';
   }
   
   function ocultarFeedback() {
     document.getElementById('feedback-area').classList.add('oculto');
   }
   
   function avancarFase() {
     const h = estado.historiaAtual;
     if (estado.faseAtual < h.fases.length - 1) {
       estado.faseAtual++;
       renderizarFase();
     } else {
       iniciarMinigames();
     }
   }
   
   function pularFase() {
     estado.ajudas += 2;
     avancarFase();
   }
   
   // =============================================
   // 11. MINIGAMES — Motor completo
   // =============================================
   
   // --- Utilitário: embaralhar array ---
   function embaralhar(arr) {
     const a = [...arr];
     for (let i = a.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [a[i], a[j]] = [a[j], a[i]];
     }
     return a;
   }

   function normalizarChavePalavra(palavra) {
     return String(palavra || '')
       .toLowerCase()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '')
       .replace(/[^a-z0-9\s-]/g, '')
       .trim();
   }

   const EMOJIS_MEMORIA_GENERICOS = new Set(['⭐', '🌟', '✨', '❓', '🔹', '🔸', '•', '']);

   const EMOJI_POR_PALAVRA = {
     leao: '🦁', leoa: '🦁', leoes: '🦁',
     zebra: '🦓', elefante: '🐘', macaco: '🐒', macaca: '🐒',
     gato: '🐱', gata: '🐱', cachorro: '🐶', cachorra: '🐶', cao: '🐶',
     coelho: '🐰', passaro: '🐦', borboleta: '🦋', peixe: '🐟', baleia: '🐋',
     dragao: '🐉', urso: '🐻', ursoa: '🐻', vaca: '🐄', porco: '🐷',
     cavalo: '🐴', ovelha: '🐑', galinha: '🐔', pato: '🦆', sapo: '🐸',
     tartaruga: '🐢', cobra: '🐍', lagarto: '🦎', crocodilo: '🐊',
     sol: '☀️', lua: '🌙', estrela: '⭐', estrelas: '⭐',
     nuvem: '☁️', nuvens: '☁️', chuva: '🌧️', vento: '💨', neve: '❄️',
     arcoiris: '🌈', ceu: '☁️', noite: '🌙', dia: '☀️', manha: '🌅',
     tarde: '🌇', floresta: '🌳', arvore: '🌳', arvores: '🌳', flor: '🌸',
     flores: '🌸', folha: '🍃', folhas: '🍃', grama: '🌿', campo: '🌾',
     mar: '🌊', rio: '🏞️', lago: '🏞️', praia: '🏖️', montanha: '⛰️',
     pedra: '🪨', pedras: '🪨', terra: '🌍', planeta: '🪐',
     casa: '🏠', escola: '🏫', parque: '🏞️', cidade: '🏙️', janela: '🪟',
     livro: '📚', livros: '📚', caderno: '📒', lapis: '✏️', caneta: '🖊️',
     bola: '⚽', brinquedo: '🧸', brinquedos: '🧸', jogo: '🎮', jogos: '🎮',
     comida: '🍽️', pao: '🍞', maca: '🍎', banana: '🍌', bolo: '🎂',
     agua: '💧', leite: '🥛', suco: '🧃',
     amigo: '👫', amiga: '👫', amigos: '👫', amizade: '🤝', familia: '👨‍👩‍👧',
     menina: '👧', menino: '👦', crianca: '🧒', criancas: '🧒',
     mae: '👩', pai: '👨', avo: '👵', avo2: '👴',
     sorriso: '😊', sorrir: '😊', feliz: '😊', alegria: '😄', felicidade: '😄',
     triste: '😢', medo: '😨', coragem: '💪', corajoso: '💪', corajosa: '💪',
     ajuda: '🤝', ajudar: '🤝', cuidado: '💛', carinho: '💛', amor: '❤️',
     parque: '🛝', brincar: '🎈', brincadeira: '🎈', festa: '🎉', celebrar: '🎉',
     correr: '🏃', pular: '🤸', dormir: '😴', cantar: '🎤', dancar: '💃',
     falar: '💬', ouvir: '👂', ver: '👀', olhar: '👀',
     fogo: '🔥', luz: '💡', escuro: '🌑', sombra: '🌑',
     mistério: '🔍', misterio: '🔍', pista: '🔎', pistas: '🔎',
     desafio: '🎯', obstaculo: '🧱', confianca: '🤝', confiar: '🤝',
     investigar: '🕵️', conflito: '⚡', perspectiva: '👁️',
     cooperacao: '🤝', justica: '⚖️', problema: '❗', solucao: '✅',
     segredo: '🤫', janela: '🪟', celular: '📱', foto: '📷', fotografia: '📷',
     desenho: '🖍️', desenhos: '🖍️', cor: '🎨', cores: '🎨', pintar: '🎨',
     vento: '💨', sul: '🧭', bota: '👢', gigante: '🦶',
     baleia: '🐋', farol: '🗼', barco: '⛵', navio: '🚢',
     foguete: '🚀', espaco: '🚀', astronauta: '👨‍🚀',
     hospital: '🏥', medico: '👨‍⚕️', dentista: '🦷',
     bicicleta: '🚲', carro: '🚗', onibus: '🚌', trem: '🚂',
     flor: '🌸', jardim: '🌻', abelha: '🐝', mel: '🍯',
     historia: '📖', conto: '📖', poema: '📝', verso: '📝',
     palavra: '📝', palavras: '📝', leitura: '📖', leitor: '📚',
     estrela: '⭐', planeta: '🪐', universo: '🌌',
     pinguim: '🐧', panda: '🐼', tigre: '🐯', leopardo: '🐆',
     coruja: '🦉', raposa: '🦊', lobo: '🐺', cervo: '🦌',
     girafa: '🦒', hipopotamo: '🦛', rinoceronte: '🦏', camelo: '🐫',
     mosca: '🪰', formiga: '🐜', aranha: '🕷️', joaninha: '🐞',
     cogumelo: '🍄', cacto: '🌵', palmeira: '🌴', pinheiro: '🌲',
     tesouro: '💎', mapa: '🗺️', chave: '🔑', porta: '🚪',
     janela: '🪟', cama: '🛏️', travesseiro: '🛏️', cobertor: '🛏️',
     chapeu: '🎩', sapato: '👟', roupa: '👕', vestido: '👗',
     chapeu: '🎩', oculos: '👓', relogio: '⌚', presente: '🎁',
     musica: '🎵', instrumento: '🎸', piano: '🎹', violao: '🎸',
     teatro: '🎭', cinema: '🎬', camera: '📷', televisao: '📺',
     computador: '💻', tablet: '📱', robo: '🤖',
     magia: '✨', fada: '🧚', bruxa: '🧙', princesa: '👸', principe: '🤴',
     castelo: '🏰', rei: '👑', rainha: '👑', coroa: '👑',
     cavaleiro: '🛡️', espada: '⚔️', escudo: '🛡️',
     pirata: '🏴‍☠️', ilha: '🏝️', tesouro: '💰',
     natal: '🎄', pascoa: '🐣', aniversario: '🎂',
     primavera: '🌷', verao: '☀️', outono: '🍂', inverno: '❄️'
   };

   const EMOJI_CHAVES_ORDENADAS = Object.keys(EMOJI_POR_PALAVRA)
     .sort((a, b) => b.length - a.length);

   function emojiParaPalavra(palavra) {
     const norm = normalizarChavePalavra(palavra);
     if (!norm) return '📝';
     if (EMOJI_POR_PALAVRA[norm]) return EMOJI_POR_PALAVRA[norm];
     const tokens = norm.split(/\s+/).filter(Boolean);
     for (const tok of tokens) {
       if (EMOJI_POR_PALAVRA[tok]) return EMOJI_POR_PALAVRA[tok];
     }
     for (const chave of EMOJI_CHAVES_ORDENADAS) {
       if (norm.includes(chave) || chave.includes(norm)) return EMOJI_POR_PALAVRA[chave];
     }
     const sufixos = [
       ['inho', ''], ['inha', ''], ['oes', ''], ['ao', ''], ['oes', ''],
       ['s', ''], ['es', ''], ['ar', ''], ['er', ''], ['ir', ''], ['or', '']
     ];
     for (const [suf, rep] of sufixos) {
       if (norm.length > suf.length + 2 && norm.endsWith(suf)) {
         const raiz = norm.slice(0, -suf.length) + rep;
         if (EMOJI_POR_PALAVRA[raiz]) return EMOJI_POR_PALAVRA[raiz];
       }
     }
     return '📝';
   }

   function enriquecerParesMemoria(paresRaw) {
     if (!Array.isArray(paresRaw)) return [];
     return paresRaw
       .map((p) => {
         const palavra = String((p.palavra != null ? p.palavra : p.Palavra) || '').trim();
         if (!palavra) return null;
         const emojiEnviado = String((p.emoji != null ? p.emoji : p.Emoji) || '').trim();
         const emojiMapeado = emojiParaPalavra(palavra);
         const usarEnviado = emojiEnviado
           && !EMOJIS_MEMORIA_GENERICOS.has(emojiEnviado)
           && emojiMapeado === '📝';
         return { palavra, emoji: usarEnviado ? emojiEnviado : emojiMapeado };
       })
       .filter(Boolean);
   }
   
   // --- Escolher minigames por faixa e gênero (sem repetição) ---
   function escolherMinigamesTipos(faixa, genero) {
     const mapa = {
       narrativo: {
        1: ['jogo_memoria', 'som_palavra', 'escolha', 'quem_disse'],
        2: ['monta_frase', 'verdadeiro_falso', 'completar', 'ordenar_passos'],
        3: ['ordenar_passos', 'quem_disse', 'completar', 'verdadeiro_falso']
       },
       poetico: {
        1: ['som_palavra', 'jogo_memoria', 'rima', 'colorir'],
        2: ['rima', 'monta_frase', 'verdadeiro_falso', 'completar'],
        3: ['rima', 'completar', 'verdadeiro_falso', 'quem_disse']
       },
       instrucional: {
        1: ['ordenar_passos', 'jogo_memoria', 'escolha', 'verdadeiro_falso'],
        2: ['ordenar_passos', 'verdadeiro_falso', 'caca_palavras', 'monta_frase'],
        3: ['ordenar_passos', 'caca_palavras', 'completar', 'verdadeiro_falso']
       },
       descritivo: {
        1: ['jogo_memoria', 'som_palavra', 'colorir', 'escolha'],
        2: ['monta_frase', 'caca_palavras', 'verdadeiro_falso', 'completar'],
        3: ['caca_palavras', 'quem_disse', 'completar', 'verdadeiro_falso']
       },
       informativo: {
        1: ['verdadeiro_falso', 'som_palavra', 'escolha', 'colorir'],
        2: ['verdadeiro_falso', 'caca_palavras', 'completar', 'monta_frase'],
        3: ['caca_palavras', 'monta_frase', 'completar', 'quem_disse']
       }
     };
     const f = Math.min(3, Math.max(1, faixa));
     const lista = (mapa[genero] && mapa[genero][f]) || ['verdadeiro_falso', 'monta_frase'];
    // Remove duplicatas e garante 4 minigames por fase/história
    const semDuplicatas = [...new Set(lista)];
    while (semDuplicatas.length < 4) {
      const fallback = ['verdadeiro_falso', 'monta_frase', 'escolha', 'completar']
        .find(t => !semDuplicatas.includes(t));
      if (!fallback) break;
      semDuplicatas.push(fallback);
    }
    return semDuplicatas.slice(0, 4);
   }
   
   function prepararMinigamesPreset(h) {
    const presetSrc = Array.isArray(h.minigamesPreset) ? h.minigamesPreset : [];
    if (presetSrc.length) {
      let preset = embaralhar(
        presetSrc.map((p) => normalizarMinigamePreset(p) || p).filter(Boolean)
      );
      const vistos = new Set();
      preset = preset.filter((p) => {
        const chave = chaveUnicaMinigame(p.tipo);
        if (vistos.has(chave)) return false;
        vistos.add(chave);
        return true;
      });
      if (preset.length < 4) {
        const extras = escolherMinigamesTipos(estado.perfil.faixa, h.genero);
        for (let i = 0; i < extras.length && preset.length < 4; i++) {
          const chave = chaveUnicaMinigame(extras[i]);
          if (vistos.has(chave)) continue;
          vistos.add(chave);
          preset.push({ tipo: extras[i], pergunta: '' });
        }
      }
      preset = preset.slice(0, 4);
      estado.minigamesLista = montarListaMinigamesUnica(
        preset.map((p) => p.tipo),
        estado.perfil.faixa,
        h.genero
      );
      const presetPorChave = {};
      preset.forEach((p) => { presetPorChave[chaveUnicaMinigame(p.tipo)] = p; });
      estado.minigamesPreset = estado.minigamesLista.map((tipo) =>
        presetPorChave[chaveUnicaMinigame(tipo)] || { tipo, pergunta: '' }
      );
    } else {
      estado.minigamesPreset = null;
      const tiposBase = escolherMinigamesTipos(estado.perfil.faixa, h.genero);
      estado.minigamesLista = montarListaMinigamesUnica(
        embaralhar(tiposBase),
        estado.perfil.faixa,
        h.genero
      );
    }
   }

   // --- Iniciar bloco de minigames ---
   function iniciarMinigames() {
     const h = estado.historiaAtual;
     prepararMinigamesPreset(h);
     estado.minigameAtual = 0;
     estado.mgAcertos = 0;
     mostrarLeituraCompleta();
   }

   function iniciarSequenciaMinigames() {
     irParaTela('minigame');
     renderizarMinigame();
   }
   
   // --- Label legível do tipo ---
   function nomeMinigame(tipo) {
     const nomes = {
      memoria:         '🃏 Jogo da Memória',
      jogo_memoria:    '🃏 Jogo da Memória',
       som_palavra:     '🔊 Som e Palavra',
       monta_frase:     '🧩 Monta-Frase',
       verdadeiro_falso:'✅ Verdadeiro ou Falso?',
       caca_palavras:   '🔍 Caça-Palavras',
       ligar_pontos:    '🔗 Ligar os Pontos',
       rima:            '🎵 Encontre a Rima',
       quem_disse:      '💬 Quem Disse Isso?',
      ordenar_passos:  '📋 Ordene os Passos',
      escolha:         '❓ Escolha Múltipla',
      completar:       '✍️ Completar',
      colorir:         '🎨 Colorir Palavras',
      palavras_perdidas:'🧠 Palavras Perdidas'
     };
     return nomes[tipo] || tipo;
   }
   
   // --- Renderizar o minigame atual ---
   function renderizarMinigame() {
    const spec =
      estado.minigamesPreset && estado.minigamesPreset[estado.minigameAtual]
        ? estado.minigamesPreset[estado.minigameAtual]
        : null;
    const tipo =
      normalizarTipoMinigame((spec && (spec.tipo || spec.Tipo)) || estado.minigamesLista[estado.minigameAtual]);
     const total = estado.minigamesLista.length;
     const h     = estado.historiaAtual;
     const fase  = h.fases[Math.min(estado.faseAtual, h.fases.length - 1)];
   
     document.getElementById('mg-titulo-label').textContent = nomeMinigame(tipo);
     document.getElementById('mg-contador').textContent     = `${estado.minigameAtual + 1} / ${total}`;
   
     // Limpa área
     document.getElementById('mg-feedback').classList.add('oculto');
     document.getElementById('btn-proximo-mg').classList.add('oculto');
     document.getElementById('btn-finalizar-mg').classList.add('oculto');
   
     const corpo = document.getElementById('minigame-corpo');
     corpo.innerHTML = '';

     const tiposSemEnunciadoDuplicado = ['completar', 'palavras_perdidas', 'escolha', 'verdadeiro_falso', 'som_palavra', 'rima', 'quem_disse'];
     if (!tiposSemEnunciadoDuplicado.includes(tipo)) {
       const header = document.createElement('div');
       header.className = 'mg-enunciado';
       header.textContent = nomeMinigame(tipo);
       corpo.appendChild(header);
     }

     // Renderiza o tipo correto
     switch (tipo) {
      case 'memoria':
      case 'jogo_memoria':     renderMemoria(fase, h, corpo, spec);           break;
       case 'som_palavra':      renderSomPalavra(fase, corpo, spec);            break;
       case 'monta_frase':      renderMontaFrase(fase, corpo, spec);           break;
       case 'verdadeiro_falso': renderVerdadeiroFalso(fase, h, corpo, spec);   break;
       case 'caca_palavras':    renderCacaPalavras(fase, h, corpo);      break;
       case 'ligar_pontos':  renderLigarPontos(fase, h, corpo);        break;
      case 'rima':             renderRima(h, corpo, spec);              break;
      case 'quem_disse':       renderQuemDisse(fase, h, corpo, spec);   break;
      case 'ordenar_passos':   renderOrdenarPassos(h, corpo, spec);     break;
      case 'escolha':          renderEscolhaMG(fase, corpo, spec);            break;
      case 'completar':        renderCompletarMG(fase, corpo, spec);          break;
      case 'colorir':          renderColorirMG(h, corpo, spec);         break;
      case 'palavras_perdidas':  renderCompletarMG(fase, corpo, spec || { tipo: 'completar' }); break;
       default:                 renderVerdadeiroFalso(fase, h, corpo, spec);
     }
   }
   
   // ─── FEEDBACK CENTRAL ───────────────────────────────────────────────────────
   
   function mostrarFeedbackMG(ok, mostrarProximo = true) {
     // Caça-palavras gerencia mgAcertos internamente — os demais incrementam aqui
    if (ok) estado.mgAcertos++;
    else estado.tentativasReprovadas++;
   
     const area  = document.getElementById('mg-feedback');
     const card  = document.getElementById('mg-feedback-card');
     const emoji = document.getElementById('mg-feedback-emoji');
     const msg   = document.getElementById('mg-feedback-msg');
   
     area.classList.remove('oculto');
   
     if (ok) {
       card.style.background  = 'linear-gradient(135deg,#DCFCE7,#D1FAE5)';
       card.style.borderColor = 'var(--cor-verde)';
       emoji.textContent      = ['🎉','🌟','🏆','💫','🚀'][Math.floor(Math.random()*5)];
       msg.textContent        = MSGS_ACERTO[Math.floor(Math.random()*MSGS_ACERTO.length)];
       msg.style.color        = '#166534';
     } else {
       card.style.background  = 'linear-gradient(135deg,#FEF3C7,#FDE68A)';
       card.style.borderColor = '#F59E0B';
       emoji.textContent      = '💛';
       msg.textContent        = MSGS_ERRO[Math.floor(Math.random()*MSGS_ERRO.length)];
       msg.style.color        = '#92400E';
     }
   
     if (mostrarProximo) {
       const isUltimo = estado.minigameAtual >= estado.minigamesLista.length - 1;
       const btnProx  = document.getElementById('btn-proximo-mg');
       const btnFin   = document.getElementById('btn-finalizar-mg');
       // último minigame → exibe "Ver Resultado", oculta "Próximo"
       btnProx.classList.toggle('oculto',  isUltimo);
       btnFin.classList.toggle('oculto',  !isUltimo);
       if (isUltimo) btnFin.textContent = 'Ver Resultado 🏆';
       else          btnProx.textContent = 'Próximo Jogo →';
       adicionarExperiencia(18, 'fase');
     }
   
     area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
   }
   
   function proximoMinigame() {
     estado.minigameAtual++;
     renderizarMinigame();
     document.getElementById('app-main').scrollTop = 0;
   }
   
   function finalizarMinigames() {
     // Tempo decorrido
     const tempoMin = Math.max(1, Math.round((Date.now() - (estado.iniciouEm || Date.now())) / 60000));
     estado.tempoTotal += tempoMin;
     estado.minigamesJogados += estado.minigamesLista.length;
   
     const acertosTotal = (estado.acertos || 0) + (estado.mgAcertos || 0);
     const totalJogos   = estado.minigamesLista.length || 4;
     const estrelas     = calcularEstrelasPorAcertos(acertosTotal, totalJogos);

     registrarEstrelasHistoria(estrelas);
     const id = estado.historiaAtual.id;
     const idx = estado.historiasLidas.findIndex(r => r.id === id);
     if (idx >= 0) {
       estado.historiasLidas[idx].data = new Date().toLocaleDateString('pt-BR');
     }
   
     adicionarExperiencia(28, 'historia');
     estado.nivel = calcularNivelPorXp(estado.experiencia || 0);

     salvarEstado();
     atualizarHeader();
     renderizarBiblioteca();
     mostrarResultado(estrelas, tempoMin, acertosTotal);
   }
   
   // ─── 1. JOGO DA MEMÓRIA ──────────────────────────────────────────────────────

   function renderMemoria(fase, h, corpo, spec) {
     let pares;
     if (spec && Array.isArray(spec.pares) && spec.pares.length >= 2) {
       pares = enriquecerParesMemoria(spec.pares).map((p, i) => ({ id: i, ...p }));
     }
     if (!pares || pares.length < 2) {
       const palavras = (h.palavrasChave || []).slice(0, 5);
       if (palavras.length < 2) { renderVerdadeiroFalso(fase, h, corpo, null); return; }
       pares = palavras.map((p, i) => ({
         id: i,
         palavra: p,
         emoji: emojiParaPalavra(p)
       }));
     }

     // Baralha: [palavra, emoji, palavra, emoji, ...]
     const cards = embaralhar([
       ...pares.map(p => ({ tipo: 'palavra', valor: p.palavra, pairId: p.id })),
       ...pares.map(p => ({ tipo: 'emoji',   valor: p.emoji,   pairId: p.id }))
     ]);

     const wrap = document.createElement('div');
     wrap.innerHTML = `
       <p class="mg-desc">Encontre os pares! Clique nos cards para virá-los e encontrar a palavra com seu emoji! 🃏</p>
       <div class="mem-grid" id="memGrid"></div>
       <div class="mem-status" id="memStatus">Pares encontrados: <strong id="memPares">0</strong> / ${pares.length}</div>
     `;
     corpo.appendChild(wrap);

     const grid = document.getElementById('memGrid');
     let virados = [];
     let paresEncontrados = 0;
     let bloqueado = false;

     cards.forEach((card, idx) => {
       const el = document.createElement('div');
       el.className = 'mem-card';
       el.dataset.idx = idx;
       el.dataset.pairId = card.pairId;
       el.dataset.tipo = card.tipo;
       el.innerHTML = `
         <div class="mem-inner">
           <div class="mem-frente">?</div>
           <div class="mem-verso">${card.valor}</div>
         </div>
       `;
       el.addEventListener('click', () => {
         if (bloqueado) return;
         if (el.classList.contains('mem-virado') || el.classList.contains('mem-acertado')) return;

         el.classList.add('mem-virado');
         virados.push({ el, card });

         if (virados.length === 2) {
           bloqueado = true;
           const [a, b] = virados;
           if (a.card.pairId === b.card.pairId && a.card.tipo !== b.card.tipo) {
             // Par correto!
             setTimeout(() => {
               a.el.classList.add('mem-acertado');
               b.el.classList.add('mem-acertado');
               paresEncontrados++;
               document.getElementById('memPares').textContent = paresEncontrados;
               virados = [];
               bloqueado = false;
               if (paresEncontrados >= pares.length) {
                 setTimeout(() => mostrarFeedbackMG(true, true), 300);
               }
             }, 500);
           } else {
             // Errou
             setTimeout(() => {
               a.el.classList.remove('mem-virado');
               b.el.classList.remove('mem-virado');
               a.el.classList.add('mem-erro-flash');
               b.el.classList.add('mem-erro-flash');
               setTimeout(() => {
                 a.el.classList.remove('mem-erro-flash');
                 b.el.classList.remove('mem-erro-flash');
               }, 400);
               virados = [];
               bloqueado = false;
             }, 900);
           }
         }
       });
       grid.appendChild(el);
     });
   }
   
   // ─── 2. SOM E PALAVRA ────────────────────────────────────────────────────────
   
   function renderSomPalavra(fase, corpo, spec) {
    const palavras  = (fase.texto.replace(/<[^>]+>/g, '').match(/\b\w{4,}\b/g) || ['leitura']).slice(0, 6);
    const alvoPreset = spec && spec.alvo ? String(spec.alvo) : '';
    const alvo = alvoPreset || palavras[Math.floor(Math.random() * palavras.length)];
    const opcoesPreset = spec && Array.isArray(spec.opcoes) && spec.opcoes.length >= 2
      ? spec.opcoes.map(String)
      : null;
    const distratores = embaralhar(
      ['estrela','nuvem','pedra','livro','vento','chuva','foguete','floresta'].filter(p => p !== alvo)
    ).slice(0, 3);
    const opcoes = opcoesPreset
      ? embaralhar(opcoesPreset.includes(alvo) ? opcoesPreset : [alvo, ...opcoesPreset])
      : embaralhar([alvo, ...distratores]);
   
     const wrap = document.createElement('div');
     wrap.innerHTML = `
       <p class="mg-desc">Ouça a palavra e escolha a correta entre as opções!</p>
       <div style="text-align:center;margin:16px 0">
         <button class="btn-ouvir-palavra" id="btnOuvirPalavra" aria-label="Ouvir palavra">
           🔊 Ouvir a palavra
         </button>
       </div>
      <div style="text-align:center;margin:0 0 12px">
        <button class="btn-secundario" id="btnNaoOuco" aria-label="Não consigo ouvir">
          Não consigo ouvir
        </button>
      </div>
       <div class="sp-grid">
         ${opcoes.map(op => `<button class="sp-btn" data-palavra="${op}" aria-label="${op}">${op}</button>`).join('')}
       </div>
     `;
     corpo.appendChild(wrap);
   
     // Lê automaticamente ao aparecer
     setTimeout(() => falarTexto(alvo), 400);
   
     document.getElementById('btnOuvirPalavra').addEventListener('click', () => falarTexto(alvo));
    document.getElementById('btnNaoOuco').addEventListener('click', () => {
      // Não penaliza, substitui por um minigame alternativo da mesma fase
      registrarEventoMG('som_palavra', 'nao_consigo_ouvir', { alvo });
      const alternativas = ['verdadeiro_falso', 'monta_frase', 'escolha', 'completar']
        .filter(t => !estado.minigamesLista.includes(t));
      const novoTipo = alternativas[0] || 'verdadeiro_falso';
      estado.minigamesLista[estado.minigameAtual] = novoTipo;
      if (estado.minigamesPreset && estado.minigamesPreset[estado.minigameAtual]) {
        estado.minigamesPreset[estado.minigameAtual] = { tipo: novoTipo };
      }
      renderizarMinigame();
      mostrarToast('Tudo bem! Vamos para outro jogo sem perder pontos 💛');
    });
   
     wrap.querySelectorAll('.sp-btn').forEach(btn => {
       btn.addEventListener('click', () => {
         const ok = btn.dataset.palavra === alvo;
        registrarEventoMG('som_palavra', ok ? 'acerto' : 'erro');
         wrap.querySelectorAll('.sp-btn').forEach(b => {
           b.disabled = true;
           if (b.dataset.palavra === alvo) b.classList.add('correta');
         });
         if (!ok) btn.classList.add('errada');
         mostrarFeedbackMG(ok);
       });
     });
   }

  function renderEscolhaMG(fase, corpo, spec) {
    let pergunta;
    let opcoes;
    let correta;
    if (spec && spec.pergunta && Array.isArray(spec.opcoes) && spec.opcoes.length >= 2) {
      pergunta = spec.pergunta;
      opcoes = spec.opcoes.map(String);
      correta = typeof spec.correta === 'number' ? spec.correta : 0;
    } else {
      const inter = fase.interacao && fase.interacao.tipo === 'escolha' ? fase.interacao : null;
      pergunta = inter ? inter.pergunta : 'Qual opção está correta sobre a história?';
      opcoes = inter ? inter.opcoes : ['Opção A', 'Opção B'];
      correta = inter ? inter.correta : 0;
    }
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <p class="mg-desc">${pergunta}</p>
      <div class="mc-opcoes">
        ${opcoes.map((op, i) => `<button class="mc-btn" data-idx="${i}">${op}</button>`).join('')}
      </div>
    `;
    corpo.appendChild(wrap);
    wrap.querySelectorAll('.mc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const ok = idx === correta;
        registrarEventoMG('escolha', ok ? 'acerto' : 'erro');
        wrap.querySelectorAll('.mc-btn').forEach(b => {
          b.disabled = true;
          if (parseInt(b.dataset.idx, 10) === correta) b.classList.add('correta');
        });
        if (!ok) btn.classList.add('errada');
        mostrarFeedbackMG(ok);
      });
    });
  }

  function registrarEventoMG(tipo, acao, dados) {
    estado.relatorioEventos.push({
      tipo: tipo,
      acao: acao,
      dados: dados || null,
      historiaId: estado.historiaAtual ? estado.historiaAtual.id : null,
      em: new Date().toISOString()
    });
    // Evita crescer indefinidamente no localStorage
    if (estado.relatorioEventos.length > 400) {
      estado.relatorioEventos = estado.relatorioEventos.slice(-400);
    }
  }

  function renderCompletarMG(fase, corpo, spec) {
    const h = estado.historiaAtual;
    const dados = montarDadosCompletarMG(fase, h, spec);
    const wrap = document.createElement('div');
    wrap.className = 'mg-completar-wrap';
    wrap.innerHTML = `
      <p class="mg-desc">${dados.instrucao}</p>
      <div class="mg-frase-lacuna" id="mgFraseLacuna">${formatarFraseLacunaHtml(dados.frase)}</div>
      ${dados.dica ? `<p class="mg-completar-dica">💡 Dica: ${dados.dica}</p>` : ''}
      <div class="mg-completar-input-row interacao-input-area">
        <input type="text" class="interacao-input mg-input-palavra" id="mgInputCompletar"
          placeholder="Digite uma palavra..." autocomplete="off" aria-label="Palavra para completar a frase" maxlength="40" />
        <button class="btn-confirmar" id="mgBtnCompletar">✓ OK</button>
      </div>
    `;
    corpo.appendChild(wrap);
    const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const input = document.getElementById('mgInputCompletar');
    const btn = document.getElementById('mgBtnCompletar');
    const resposta = dados.resposta;
    const validar = () => {
      const v = norm(input.value);
      const c = norm(resposta);
      const ok = v === c || (v.length >= 2 && (c.includes(v) || v.includes(c)));
      registrarEventoMG('completar', ok ? 'acerto' : 'erro');
      input.disabled = true;
      btn.disabled = true;
      input.value = resposta;
      input.classList.add('correta');
      if (!ok) input.classList.add('errada');
      mostrarFeedbackMG(ok);
    };
    btn.addEventListener('click', validar);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') validar(); });
  }

  function renderColorirMG(h, corpo, spec) {
    const alvo = (spec && Array.isArray(spec.palavrasAlvo) && spec.palavrasAlvo.length
      ? spec.palavrasAlvo
      : (h.palavrasChave || []).slice(0, 5));
    const distratoras = (spec && Array.isArray(spec.distratoras) && spec.distratoras.length
      ? spec.distratoras
      : ['castelo', 'peixe', 'janela', 'foguete', 'estrada'])
      .filter((p) => !alvo.includes(p))
      .slice(0, 3);
    const itens = embaralhar([...alvo.map((p) => ({ p, correta: true })), ...distratoras.map((p) => ({ p, correta: false }))]);
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <p class="mg-desc">Clique nas palavras que aparecem na história!</p>
      <div class="rima-opcoes-grid">
        ${itens.map((it, i) => `<button class="rima-opc" data-idx="${i}">${it.p}</button>`).join('')}
      </div>
      <button class="btn-confirmar" id="btnConfColorir" style="margin-top:12px;width:100%">✔ Confirmar</button>
    `;
    corpo.appendChild(wrap);
    const selecionadas = new Set();
    wrap.querySelectorAll('.rima-opc').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        if (selecionadas.has(idx)) {
          selecionadas.delete(idx);
          btn.classList.remove('correta');
        } else {
          selecionadas.add(idx);
          btn.classList.add('correta');
        }
      });
    });
    document.getElementById('btnConfColorir').addEventListener('click', () => {
      let ok = true;
      itens.forEach((it, idx) => {
        const marcado = selecionadas.has(idx);
        if (marcado !== it.correta) ok = false;
      });
      registrarEventoMG('colorir', ok ? 'acerto' : 'erro');
      wrap.querySelectorAll('.rima-opc').forEach((btn, idx) => {
        btn.disabled = true;
        btn.classList.remove('correta');
        if (itens[idx].correta) btn.classList.add('correta');
        else if (selecionadas.has(idx)) btn.classList.add('errada');
      });
      document.getElementById('btnConfColorir').disabled = true;
      mostrarFeedbackMG(ok);
    });
  }
   
   // ─── 3. MONTA-FRASE ──────────────────────────────────────────────────────────
   
   function renderMontaFrase(fase, corpo, spec) {
    const dadosSpec = spec ? extrairDadosMontaFrase(spec) : null;
    if (dadosSpec && dadosSpec.palavrasPool.length >= 2 && dadosSpec.palavrasCorretas.length >= 2) {
      const embaralhadas = embaralhar(dadosSpec.palavrasPool.map(String));
      const palavrasCorretas = dadosSpec.palavrasCorretas.map(String);
      let colocadosIdx = [];
      const wrap = document.createElement('div');
      wrap.className = 'mf-wrap';
      wrap.innerHTML = `
        <p class="mg-desc">${dadosSpec.pergunta}</p>
        <p class="mg-desc">Monte a frase clicando nas palavras. Clique em uma palavra já colocada para removê-la.</p>
        <div class="mf-espaco" id="mfEspaco"><span class="mf-placeholder">Clique nas palavras abaixo…</span></div>
        <div class="mf-pool" id="mfPool"></div>
        <button class="btn-confirmar" id="btnConfMF" style="margin-top:12px;width:100%">✔ Verificar</button>
      `;
      corpo.appendChild(wrap);
      function atualizarPreset() {
        const pool = document.getElementById('mfPool');
        const espaco = document.getElementById('mfEspaco');
        pool.innerHTML = embaralhadas.map((p, i) =>
          `<button class="mf-chip ${colocadosIdx.includes(i) ? 'mf-usada' : ''}" data-idx="${i}">${p}</button>`
        ).join('');
        if (colocadosIdx.length === 0) {
          espaco.innerHTML = '<span class="mf-placeholder">Clique nas palavras abaixo…</span>';
        } else {
          espaco.innerHTML = colocadosIdx.map((i, pos) =>
            `<button class="mf-colocada" data-pos="${pos}">${embaralhadas[i]}</button>`
          ).join('');
        }
        pool.querySelectorAll('.mf-chip:not(.mf-usada)').forEach(btn => {
          btn.addEventListener('click', () => {
            colocadosIdx.push(parseInt(btn.dataset.idx, 10));
            atualizarPreset();
          });
        });
        espaco.querySelectorAll('.mf-colocada').forEach(btn => {
          btn.addEventListener('click', () => {
            colocadosIdx.splice(parseInt(btn.dataset.pos, 10), 1);
            atualizarPreset();
          });
        });
      }
      atualizarPreset();
      const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      document.getElementById('btnConfMF').addEventListener('click', () => {
        if (colocadosIdx.length < 2) { mostrarToast('Monte a frase primeiro! 😊'); return; }
        const tentativa = norm(colocadosIdx.map(i => embaralhadas[i]).join(' '));
        const correta = norm(palavrasCorretas.join(' '));
        const ok = tentativa === correta;
        document.getElementById('btnConfMF').disabled = true;
        revelarMontaFraseCorreta(palavrasCorretas);
        registrarEventoMG('monta_frase', ok ? 'acerto' : 'erro');
        mostrarFeedbackMG(ok);
      });
      return;
    }

     const textoLimpo = fase.texto.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
     const todasFrases = textoLimpo.split(/[.!?]/).map(f => f.trim()).filter(f => {
       const p = f.split(' ').filter(Boolean);
       return p.length >= 3 && p.length <= 9;
     });
     const frase = todasFrases[0] || textoLimpo.split(' ').slice(0, 7).join(' ');
     const palavrasCorretas = frase.split(' ').filter(Boolean);
     const embaralhadas     = embaralhar([...palavrasCorretas]);

     let colocadosIdx = [];

     const wrap = document.createElement('div');
     wrap.className = 'mf-wrap';
     wrap.innerHTML = `
       <div class="mg-texto-contexto">${fase.texto}</div>
       <p class="mg-desc">Monte a frase clicando nas palavras. Clique em uma palavra já colocada para removê-la.</p>
       <div class="mf-espaco" id="mfEspaco"><span class="mf-placeholder">Clique nas palavras abaixo…</span></div>
       <div class="mf-pool" id="mfPool"></div>
       <button class="btn-confirmar" id="btnConfMF" style="margin-top:12px;width:100%">✔ Verificar</button>
     `;
     corpo.appendChild(wrap);
   
     function atualizar() {
       const pool   = document.getElementById('mfPool');
       const espaco = document.getElementById('mfEspaco');
   
       // Pool: todas as palavras; desativadas se já usadas
       pool.innerHTML = embaralhadas.map((p, i) =>
         `<button class="mf-chip ${colocadosIdx.includes(i) ? 'mf-usada' : ''}" data-idx="${i}">${p}</button>`
       ).join('');
   
       // Espaço: palavras colocadas em ordem
       if (colocadosIdx.length === 0) {
         espaco.innerHTML = '<span class="mf-placeholder">Clique nas palavras abaixo…</span>';
       } else {
         espaco.innerHTML = colocadosIdx.map((i, pos) =>
           `<button class="mf-colocada" data-pos="${pos}">${embaralhadas[i]}</button>`
         ).join('');
       }
   
       // Eventos pool
       pool.querySelectorAll('.mf-chip:not(.mf-usada)').forEach(btn => {
         btn.addEventListener('click', () => {
           colocadosIdx.push(parseInt(btn.dataset.idx));
           atualizar();
         });
       });
       // Eventos espaço (remover)
       espaco.querySelectorAll('.mf-colocada').forEach(btn => {
         btn.addEventListener('click', () => {
           colocadosIdx.splice(parseInt(btn.dataset.pos), 1);
           atualizar();
         });
       });
     }
     atualizar();
   
     document.getElementById('btnConfMF').addEventListener('click', () => {
       if (colocadosIdx.length < 2) { mostrarToast('Monte a frase primeiro! 😊'); return; }
       const tentativa = colocadosIdx.map(i => embaralhadas[i]).join(' ').toLowerCase().trim();
       const correta   = palavrasCorretas.join(' ').toLowerCase().trim();
       const ok = tentativa === correta;
       document.getElementById('btnConfMF').disabled = true;
       revelarMontaFraseCorreta(palavrasCorretas);
       registrarEventoMG('monta_frase', ok ? 'acerto' : 'erro');
       mostrarFeedbackMG(ok);
     });
   }
   
   // ─── 4. VERDADEIRO OU FALSO ──────────────────────────────────────────────────
   
   function renderVerdadeiroFalso(fase, h, corpo, spec) {
     let item;
     if (spec && (spec.afirmacao || spec.pergunta) && typeof spec.correta === 'number') {
       const afirmacao = String(spec.afirmacao || spec.pergunta || '').trim();
       item = { afirmacao, correta: spec.correta === 0 };
     } else if (spec && (spec.afirmacao || spec.pergunta)) {
       const afirmacao = String(spec.afirmacao || spec.pergunta || '').trim();
       item = { afirmacao, correta: true };
     } else {
     const kw = (h.palavrasChave || ['personagem'])[0];
     const textoFase = fase.texto.replace(/<[^>]+>/g, '').split(/[.!?]/)[0].trim();
   
     const pares = [
       { afirmacao: textoFase.length > 10 ? textoFase + '.' : `A história fala sobre "${kw}".`, correta: true },
       { afirmacao: `A história se passa em outro planeta.`, correta: false },
       { afirmacao: `${kw} é mencionado na história.`, correta: true },
       { afirmacao: `A história não tem personagens.`, correta: false }
     ];
     item = pares[Math.floor(Math.random() * pares.length)];
     }
   
     const wrap = document.createElement('div');
     wrap.innerHTML = `
       <p class="mg-desc">Leia a afirmação e diga se é verdadeira ou falsa!</p>
       <div class="tf-afirmacao">"${item.afirmacao}"</div>
       <div class="tf-opcoes">
         <button class="tf-btn tf-v" id="tfV" aria-label="Verdadeiro">✅ Verdadeiro</button>
         <button class="tf-btn tf-f" id="tfF" aria-label="Falso">❌ Falso</button>
       </div>
     `;
     corpo.appendChild(wrap);
   
     const verificar = (resp) => {
       const ok = resp === item.correta;
       document.getElementById('tfV').disabled = true;
       document.getElementById('tfF').disabled = true;
       const btnCorreto = item.correta ? document.getElementById('tfV') : document.getElementById('tfF');
       btnCorreto.classList.add('correta');
       if (!ok) (resp ? document.getElementById('tfV') : document.getElementById('tfF')).classList.add('errada');
      registrarEventoMG('verdadeiro_falso', ok ? 'acerto' : 'erro');
       mostrarFeedbackMG(ok);
     };
   
     document.getElementById('tfV').addEventListener('click', () => verificar(true));
     document.getElementById('tfF').addEventListener('click', () => verificar(false));
   }
   
   // ─── 5. CAÇA-PALAVRAS ────────────────────────────────────────────────────────

   function renderCacaPalavras(fase, h, corpo) {
     // Normaliza: sem acento, só A-Z, corta em 15 letras (limite máximo)
     const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'').substring(0, 15);
     const palavrasAlvo = [...new Set(
       (h.palavrasChave || []).map(normalize).filter(p => p.length >= 3 && p.length <= 15)
     )].slice(0, 4);

     if (palavrasAlvo.length === 0) { renderVerdadeiroFalso(fase, h, corpo, null); return; }

     // Grade 12×12
     const TAM = 12;
     const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
     const grade  = Array.from({ length: TAM }, () => Array(TAM).fill(''));
     const posicoes = {};

     palavrasAlvo.forEach(palavra => {
       const dirs = [{ dr:0, dc:1 }, { dr:1, dc:0 }];
       let inserida = false;
       for (let t = 0; t < 500 && !inserida; t++) {
         const { dr, dc } = dirs[Math.floor(Math.random() * dirs.length)];
         const maxR = dr === 0 ? TAM : TAM - palavra.length;
         const maxC = dc === 0 ? TAM : TAM - palavra.length;
         if (maxR <= 0 || maxC <= 0) continue;
         const sR = Math.floor(Math.random() * maxR);
         const sC = Math.floor(Math.random() * maxC);
         let ok = true;
         for (let i = 0; i < palavra.length; i++) {
           const r = sR + dr*i, c = sC + dc*i;
           if (grade[r][c] !== '' && grade[r][c] !== palavra[i]) { ok = false; break; }
         }
         if (ok) {
           const cells = [];
           for (let i = 0; i < palavra.length; i++) {
             grade[sR + dr*i][sC + dc*i] = palavra[i];
             cells.push({ r: sR + dr*i, c: sC + dc*i });
           }
           posicoes[palavra] = cells;
           inserida = true;
         }
       }
     });

     for (let r = 0; r < TAM; r++)
       for (let c = 0; c < TAM; c++)
         if (grade[r][c] === '')
           grade[r][c] = LETRAS[Math.floor(Math.random() * LETRAS.length)];

     const dispW = Math.min(window.innerWidth, 700) - 48;
     const CEL   = Math.max(22, Math.min(30, Math.floor(dispW / TAM)));
     const FSIZE = Math.max(9, CEL - 14);

     const CORES_PALAVRAS = ['#A855F7','#FF6B35','#22C55E','#3B82F6'];

     const wrap = document.createElement('div');
     wrap.innerHTML = `
       <p class="mg-desc">Arraste da <strong>primeira</strong> até a <strong>última letra</strong> para marcar a palavra!</p>
       <div class="cp-alvos" id="cpAlvos">
         ${palavrasAlvo.map((p, i) => `<span class="cp-alvo" id="cpa-${p}" style="--cor-palavra:${CORES_PALAVRAS[i % CORES_PALAVRAS.length]}">${p}</span>`).join('')}
       </div>
       <div class="cp-scroll-wrap">
         <div class="cp-grade" id="cpGrade" style="grid-template-columns:repeat(${TAM},${CEL}px);width:${TAM*CEL+TAM*2}px"></div>
       </div>
       <button class="btn-confirmar" id="btnConfCP" style="margin-top:14px;width:100%">✔ Terminei</button>
     `;
     corpo.appendChild(wrap);

     const gridEl = document.getElementById('cpGrade');
     for (let r = 0; r < TAM; r++) {
       for (let c = 0; c < TAM; c++) {
         const cell = document.createElement('div');
         cell.className  = 'cp-cel';
         cell.style.cssText = `width:${CEL}px;height:${CEL}px;font-size:${FSIZE}px`;
         cell.textContent = grade[r][c];
         cell.dataset.r = r;
         cell.dataset.c = c;
         gridEl.appendChild(cell);
       }
     }

     // Estado de drag/seleção
     let arrastando  = false;
     let primeira    = null;
     let encontradas = new Set();
     let corIdx      = 0;

     function getCell(r, c) { return gridEl.children[r * TAM + c]; }

     function limparPreview() {
       gridEl.querySelectorAll('.cp-preview').forEach(el => {
         el.classList.remove('cp-preview');
         el.style.removeProperty('--preview-color');
       });
     }

     function coletarSegmento(r1, c1, r2, c2) {
       const dr = r1 === r2 ? 0 : (r2 > r1 ? 1 : -1);
       const dc = c1 === c2 ? 0 : (c2 > c1 ? 1 : -1);
       const res = [];
       let r = r1, c = c1;
       for (;;) {
         res.push({ r, c, letra: grade[r][c] });
         if (r === r2 && c === c2) break;
         r += dr; c += dc;
       }
       return res;
     }

     function destacarPreview(r1, c1, r2, c2, cor) {
       limparPreview();
       const dr = r1 === r2 ? 0 : (r2 > r1 ? 1 : -1);
       const dc = c1 === c2 ? 0 : (c2 > c1 ? 1 : -1);
       if (dr !== 0 && dc !== 0) return;
       let r = r1, c = c1;
       for (;;) {
         const el = getCell(r, c);
         if (el && !el.classList.contains('cp-found')) {
           el.classList.add('cp-preview');
           el.style.setProperty('--preview-color', cor);
         }
         if (r === r2 && c === c2) break;
         r += dr; c += dc;
       }
     }

     function tentarConfirmar(r1, c1, r2, c2) {
       const isH = r1 === r2, isV = c1 === c2;
       if (!isH && !isV) return false;
       const seg = coletarSegmento(r1, c1, r2, c2);
       const palavra  = seg.map(s => s.letra).join('');
       const palavraR = [...palavra].reverse().join('');
       limparPreview();

       const match = palavrasAlvo.find(p => p === palavra || p === palavraR);
       if (match && !encontradas.has(match)) {
         const cor = CORES_PALAVRAS[palavrasAlvo.indexOf(match) % CORES_PALAVRAS.length];
         encontradas.add(match);
         seg.forEach(({ r: sr, c: sc }) => {
           const el = getCell(sr, sc);
           if (el) {
             el.classList.remove('cp-preview');
             el.classList.add('cp-found');
             el.style.setProperty('--found-color', cor);
           }
         });
         document.getElementById('cpa-' + match)?.classList.add('cp-alvo-found');

         if (encontradas.size >= palavrasAlvo.length) {
           mostrarFeedbackMG(true, true);
           document.getElementById('btnConfCP').disabled = true;
         } else {
           const area = document.getElementById('mg-feedback');
           const card = document.getElementById('mg-feedback-card');
           const emoji = document.getElementById('mg-feedback-emoji');
           const msg   = document.getElementById('mg-feedback-msg');
           area.classList.remove('oculto');
           card.style.background  = 'linear-gradient(135deg,#DCFCE7,#D1FAE5)';
           card.style.borderColor = 'var(--cor-verde)';
           emoji.textContent      = '🎉';
           msg.textContent        = `Encontrou "${match}"! (${encontradas.size}/${palavrasAlvo.length})`;
           msg.style.color        = '#166534';
         }
         return true;
       } else if (!match || encontradas.has(match)) {
         seg.forEach(({ r: sr, c: sc }) => {
           const el = getCell(r, sc);
           if (el) { el.classList.add('cp-wrong'); setTimeout(() => el.classList.remove('cp-wrong'), 500); }
         });
         return false;
       }
       return false;
     }

     // Eventos: mouse e touch
     function getCellFromPoint(x, y) {
       const els = document.elementsFromPoint(x, y);
       return els.find(e => e.classList.contains('cp-cel'));
     }

     const PREVIEW_COLOR = '#FBBF24';

     gridEl.querySelectorAll('.cp-cel').forEach(cell => {
       // Mouse
       cell.addEventListener('mousedown', (e) => {
         e.preventDefault();
         if (cell.classList.contains('cp-found')) return;
         arrastando = true;
         primeira = { r: parseInt(cell.dataset.r), c: parseInt(cell.dataset.c) };
         limparPreview();
         cell.classList.add('cp-sel');
       });

       cell.addEventListener('mouseenter', (e) => {
         if (!arrastando || !primeira) return;
         if (cell.classList.contains('cp-found')) return;
         const r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
         gridEl.querySelectorAll('.cp-sel').forEach(el => el.classList.remove('cp-sel'));
         destacarPreview(primeira.r, primeira.c, r, c, PREVIEW_COLOR);
       });

       cell.addEventListener('mouseup', (e) => {
         if (!arrastando || !primeira) return;
         const r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
         if (r === primeira.r && c === primeira.c) {
           limparPreview();
           cell.classList.remove('cp-sel');
           arrastando = false; primeira = null; return;
         }
         tentarConfirmar(primeira.r, primeira.c, r, c);
         gridEl.querySelectorAll('.cp-sel').forEach(el => el.classList.remove('cp-sel'));
         arrastando = false; primeira = null;
       });
     });

     // Touch support
     gridEl.addEventListener('touchstart', (e) => {
       e.preventDefault();
       const t = e.touches[0];
       const cell = getCellFromPoint(t.clientX, t.clientY);
       if (!cell || cell.classList.contains('cp-found')) return;
       arrastando = true;
       primeira = { r: parseInt(cell.dataset.r), c: parseInt(cell.dataset.c) };
       limparPreview();
       cell.classList.add('cp-sel');
     }, { passive: false });

     gridEl.addEventListener('touchmove', (e) => {
       e.preventDefault();
       if (!arrastando || !primeira) return;
       const t = e.touches[0];
       const cell = getCellFromPoint(t.clientX, t.clientY);
       if (!cell || cell.classList.contains('cp-found')) return;
       const r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
       gridEl.querySelectorAll('.cp-sel').forEach(el => el.classList.remove('cp-sel'));
       destacarPreview(primeira.r, primeira.c, r, c, PREVIEW_COLOR);
     }, { passive: false });

     gridEl.addEventListener('touchend', (e) => {
       e.preventDefault();
       if (!arrastando || !primeira) return;
       const t = e.changedTouches[0];
       const cell = getCellFromPoint(t.clientX, t.clientY);
       if (cell) {
         const r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
         if (!(r === primeira.r && c === primeira.c)) {
           tentarConfirmar(primeira.r, primeira.c, r, c);
         }
       }
       limparPreview();
       gridEl.querySelectorAll('.cp-sel').forEach(el => el.classList.remove('cp-sel'));
       arrastando = false; primeira = null;
     }, { passive: false });

     document.addEventListener('mouseup', () => {
       if (arrastando) {
         limparPreview();
         gridEl.querySelectorAll('.cp-sel').forEach(el => el.classList.remove('cp-sel'));
         arrastando = false; primeira = null;
       }
     });

     // Botão Terminei
     document.getElementById('btnConfCP').addEventListener('click', () => {
       document.getElementById('btnConfCP').disabled = true;
       palavrasAlvo.forEach(palavra => {
         if (!encontradas.has(palavra) && posicoes[palavra]) {
           const cor = CORES_PALAVRAS[palavrasAlvo.indexOf(palavra) % CORES_PALAVRAS.length];
           posicoes[palavra].forEach(({ r, c }) => {
             const el = getCell(r, c);
             if (el) {
               el.classList.add('cp-missed');
               el.style.setProperty('--found-color', cor);
             }
           });
           document.getElementById('cpa-' + palavra)?.classList.add('cp-alvo-found');
         }
       });
       const ok = encontradas.size >= palavrasAlvo.length;
       registrarEventoMG('caca_palavras', ok ? 'acerto' : 'erro');
       mostrarFeedbackMG(ok);
     });
   }
   
   
   // ─── 6. LIGAR OS PONTOS ──────────────────────────────────────────────────────
   
   function renderLigarPontos(fase, h, corpo) {
     const BANCO_DEFS = {
       sol:'Estrela que ilumina o dia', lua:'Astro que brilha à noite',
       agua:'Líquido essencial à vida', fogo:'Chama que aquece e ilumina',
       vento:'Movimento do ar', chuva:'Água que cai do céu',
       flor:'Parte colorida da planta', arvore:'Planta de tronco grande',
       peixe:'Animal que vive na água', passaro:'Animal que voa com asas',
       casa:'Lugar onde a família vive', escola:'Lugar onde se aprende',
       livro:'Objeto cheio de histórias', menino:'Criança do sexo masculino',
       menina:'Criança do sexo feminino', gato:'Animal doméstico que mia',
       cachorro:'Animal doméstico que late', cavalo:'Animal que galopa',
       leao:'Rei da selva com juba', floresta:'Conjunto de muitas árvores',
       mar:'Grande extensão de água salgada', rio:'Corrente de água doce',
       montanha:'Elevação grande de terra', estrela:'Ponto de luz no céu',
       nuvem:'Massa de vapor no céu', pedra:'Material sólido da natureza',
       terra:'Solo onde as plantas crescem', mel:'Alimento doce das abelhas',
       rei:'Governante de um reino', rainha:'Governante de um reino',
       fada:'Ser mágico das histórias', dragao:'Criatura mítica que cospe fogo',
       gigante:'Ser de tamanho enorme', bruxa:'Personagem mágica das fábulas',
       castelo:'Grande construção de pedra', magia:'Poder sobrenatural',
       coragem:'Força para enfrentar o medo', amizade:'Laço afetivo entre pessoas',
       pao:'Alimento feito de farinha', barco:'Veículo que navega na água',
       ponte:'Estrutura que une dois lados', navio:'Grande barco do mar',
       praia:'Areia à beira do mar', campo:'Área aberta de terra',
       cidade:'Local com muitas casas', aldeia:'Pequeno grupo de casas',
     };
   
     const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'');
     const FALLBACK = [
       {palavra:'Sol',   def:'Estrela que ilumina o dia'},
       {palavra:'Lua',   def:'Astro que brilha à noite'},
       {palavra:'Livro', def:'Objeto cheio de histórias'},
       {palavra:'Flor',  def:'Parte colorida da planta'},
     ];
   
     let pares = [];
     (h.palavrasChave || []).forEach(kw => {
       const k = norm(kw);
       if (BANCO_DEFS[k] && !pares.find(p => norm(p.palavra) === k))
         pares.push({ palavra: kw, def: BANCO_DEFS[k] });
     });
     while (pares.length < 3) {
       const fb = FALLBACK[pares.length % FALLBACK.length];
       if (!pares.find(p => norm(p.palavra) === norm(fb.palavra))) pares.push(fb);
       else pares.push(FALLBACK[(pares.length + 1) % FALLBACK.length]);
     }
     pares = pares.slice(0, 4);
   
     const esquerda = embaralhar([...pares]);
     const direita  = embaralhar([...pares]);
     const CORES = ['#A855F7','#FF6B35','#22C55E','#3B82F6'];
   
     let selecionado = null;
     let ligacoes    = []; // {eKey, dKey, cor}
     let acertos     = 0;
   
     const wrap = document.createElement('div');
     wrap.className = 'lp-wrap';
     wrap.innerHTML = `
       <p class="mg-desc">Clique em uma <strong>palavra</strong> e depois em sua <strong>definição</strong> para ligar!</p>
       <div class="lp-arena" id="lpArena">
         <div class="lp-col" id="lpEsq">
           ${esquerda.map((p,i)=>`<button class="lp-btn lp-palavra" data-lado="esq" data-i="${i}" data-k="${norm(p.palavra)}">${p.palavra}</button>`).join('')}
         </div>
         <div class="lp-col" id="lpDir">
           ${direita.map((p,i)=>`<button class="lp-btn lp-def" data-lado="dir" data-i="${i}" data-k="${norm(p.palavra)}">${p.def}</button>`).join('')}
         </div>
       </div>
       <svg class="lp-svg" id="lpSvg"></svg>
       <button class="btn-confirmar" id="btnConfLP" style="margin-top:14px;width:100%">✔ Verificar</button>
     `;
     corpo.appendChild(wrap);
   
     // ── Linhas ──────────────────────────────────────────────────────────────────
     function midRight(el) {
       const wr = wrap.getBoundingClientRect();
       const er = el.getBoundingClientRect();
       return { x: er.right - wr.left, y: er.top + er.height / 2 - wr.top };
     }
     function midLeft(el) {
       const wr = wrap.getBoundingClientRect();
       const er = el.getBoundingClientRect();
       return { x: er.left - wr.left, y: er.top + er.height / 2 - wr.top };
     }
   
     function redrawSvg() {
       const svg = document.getElementById('lpSvg');
       if (!svg) return;
       const wr = wrap.getBoundingClientRect();
       svg.setAttribute('width',  wr.width);
       svg.setAttribute('height', wr.height);
       svg.innerHTML = '';
       ligacoes.forEach(lig => {
         const eEl = wrap.querySelector(`#lpEsq [data-k="${lig.eKey}"]`);
         const dEl = wrap.querySelector(`#lpDir [data-k="${lig.dKey}"]`);
         if (!eEl || !dEl) return;
         const p1 = midRight(eEl);
         const p2 = midLeft(dEl);
         const cx = (p1.x + p2.x) / 2;
         const path = document.createElementNS('http://www.w3.org/2000/svg','path');
         path.setAttribute('d', `M${p1.x},${p1.y} C${cx},${p1.y} ${cx},${p2.y} ${p2.x},${p2.y}`);
         path.setAttribute('stroke', lig.cor);
         path.setAttribute('stroke-width', '3.5');
         path.setAttribute('fill', 'none');
         path.setAttribute('stroke-linecap', 'round');
         svg.appendChild(path);
       });
     }
   
     // ── Cliques ──────────────────────────────────────────────────────────────────
     wrap.querySelectorAll('.lp-btn').forEach(btn => {
       btn.addEventListener('click', () => {
         if (btn.classList.contains('lp-ligado')) return;
         const lado = btn.dataset.lado;
         const k    = btn.dataset.k;
   
         if (!selecionado) {
           wrap.querySelectorAll('.lp-btn.lp-ativo').forEach(b => b.classList.remove('lp-ativo'));
           btn.classList.add('lp-ativo');
           selecionado = { lado, k };
           return;
         }
   
         // Mesmo lado → troca seleção
         if (selecionado.lado === lado) {
           wrap.querySelectorAll('.lp-btn.lp-ativo').forEach(b => b.classList.remove('lp-ativo'));
           btn.classList.add('lp-ativo');
           selecionado = { lado, k };
           return;
         }
   
         // Lados opostos → testa par
         const eKey = lado === 'dir' ? selecionado.k : k;
         const dKey = lado === 'dir' ? k : selecionado.k;
         wrap.querySelectorAll('.lp-btn.lp-ativo').forEach(b => b.classList.remove('lp-ativo'));
         selecionado = null;
   
         const ok  = eKey === dKey;
         const cor = ok ? CORES[acertos % CORES.length] : '#EF4444';
         const eEl = wrap.querySelector(`#lpEsq [data-k="${eKey}"]`);
         const dEl = wrap.querySelector(`#lpDir [data-k="${dKey}"]`);
   
         if (ok) {
           acertos++;
           [eEl, dEl].forEach(el => {
             el.classList.add('lp-ligado','lp-certo');
             el.style.borderColor = cor;
             el.style.color = cor;
           });
           ligacoes.push({ eKey, dKey, cor });
           // Pequeno delay para o DOM pintar antes de medir posições
           requestAnimationFrame(() => redrawSvg());
           if (acertos >= pares.length) {
             setTimeout(() => mostrarFeedbackMG(true, true), 400);
             document.getElementById('btnConfLP').disabled = true;
           }
         } else {
           [eEl, dEl].forEach(el => {
             if (!el) return;
             el.classList.add('lp-erro');
             setTimeout(() => el.classList.remove('lp-erro'), 600);
           });
         }
       });
     });
   
     // ── Verificar ────────────────────────────────────────────────────────────────
     document.getElementById('btnConfLP').addEventListener('click', () => {
       document.getElementById('btnConfLP').disabled = true;
       // Revela não ligados em cinza
       pares.forEach(par => {
         const k = norm(par.palavra);
         const eEl = wrap.querySelector(`#lpEsq [data-k="${k}"]`);
         const dEl = wrap.querySelector(`#lpDir [data-k="${k}"]`);
         if (eEl && dEl && !eEl.classList.contains('lp-ligado')) {
           [eEl, dEl].forEach(el => el.classList.add('lp-revelado'));
           ligacoes.push({ eKey: k, dKey: k, cor: '#9CA3AF' });
         }
       });
       requestAnimationFrame(() => redrawSvg());
       mostrarFeedbackMG(acertos > 0, true);
     });
   
     // Redesenha ao redimensionar
     const onResize = () => requestAnimationFrame(() => redrawSvg());
     window.addEventListener('resize', onResize);
   }
   
   // ─── 7. RIMA ────────────────────────────────────────────────────────────────
   
  function renderRima(h, corpo, spec) {
     const pares = [
       { palavra:'sol',   rima:'farol',  erradas:['livro','pedra','chuva'] },
       { palavra:'mar',   rima:'voar',   erradas:['correr','dormir','andar'] },
       { palavra:'flor',  rima:'amor',   erradas:['pedra','vento','carro'] },
       { palavra:'lua',   rima:'rua',    erradas:['livro','estrela','pedra'] },
       { palavra:'pão',   rima:'mão',    erradas:['neve','chuva','bola'] },
       { palavra:'gato',  rima:'prato',  erradas:['nuvem','janela','caixa'] },
       { palavra:'fada',  rima:'espada', erradas:['livro','pedra','carro'] },
       { palavra:'chuva', rima:'uva',    erradas:['pedra','livro','nuvem'] },
       { palavra:'leão',  rima:'balão',  erradas:['pedra','carro','livro'] },
       { palavra:'fogo',  rima:'jogo',   erradas:['pedra','livro','carro'] }
     ];
    let par;
    let opcoes;
    if (spec && spec.palavra && spec.rima && Array.isArray(spec.opcoes) && spec.opcoes.length >= 2) {
      par = { palavra: String(spec.palavra), rima: String(spec.rima), erradas: [] };
      opcoes = embaralhar(spec.opcoes.map(String));
    } else {
      const kws = (h.palavrasChave || []).map(p => p.toLowerCase());
      par = pares.find(pr => kws.some(k => k.includes(pr.palavra) || pr.palavra.includes(k)));
      if (!par) par = pares[Math.floor(Math.random() * pares.length)];
      opcoes = embaralhar([par.rima, ...par.erradas.slice(0,3)]);
    }
   
     const wrap = document.createElement('div');
     wrap.innerHTML = `
       <p class="mg-desc">Escolha a palavra que rima com a palavra destacada!</p>
       <div class="rima-destaque">
         <span class="rima-label">Rima com:</span>
         <span class="rima-palavra-alvo">${par.palavra}</span>
       </div>
       <div class="rima-opcoes-grid">
         ${opcoes.map(op => `<button class="rima-opc" data-rima="${op}" aria-label="${op}">${op}</button>`).join('')}
       </div>
     `;
     corpo.appendChild(wrap);
   
     wrap.querySelectorAll('.rima-opc').forEach(btn => {
       btn.addEventListener('click', () => {
         const ok = btn.dataset.rima === par.rima;
         wrap.querySelectorAll('.rima-opc').forEach(b => {
           b.disabled = true;
           if (b.dataset.rima === par.rima) b.classList.add('correta');
         });
         if (!ok) btn.classList.add('errada');
         mostrarFeedbackMG(ok);
       });
     });
   }
   
   // ─── 8. QUEM DISSE ISSO? ────────────────────────────────────────────────────
   
  function renderQuemDisse(fase, h, corpo, spec) {
     // Coleta personagens de todas as fases
     const todos = [...new Set(
       h.fases.flatMap(f => (f.personagens || []))
     )].filter(Boolean);
   
     // Fallback: palavras-chave como personagens
    let alvo = 'Narrador';
    let opcoes = [];
    let trecho = '';
    if (spec && Array.isArray(spec.opcoes) && spec.opcoes.length >= 2) {
      opcoes = spec.opcoes.map(String);
      alvo = opcoes[Math.min(opcoes.length - 1, Math.max(0, normalizarCorreta(spec.correta)))];
      trecho = String(spec.fala || spec.pergunta || '').trim();
    } else {
      const personagens = todos.length > 0 ? todos : (h.palavrasChave || []).slice(0, 3);
      alvo = personagens[0] || 'Narrador';
      const distratores = embaralhar(
        ['Narrador','Dragão','Fada','Rei','Bruxo','Lobo','Gigante'].filter(p => p !== alvo)
      ).slice(0, 3);
      opcoes = embaralhar([alvo, ...distratores]);
      const textoLimpo = fase.texto.replace(/<[^>]+>/g, '');
      trecho = textoLimpo.substring(0, 90).trim() + '…';
    }
   
     const wrap = document.createElement('div');
     wrap.innerHTML = `
       <p class="mg-desc">Leia o trecho e descubra quem disse isso na história!</p>
       <div class="qd-trecho">"${trecho}"</div>
       <div class="qd-opcoes">
         ${opcoes.map(op => `<button class="qd-btn" data-nome="${op}" aria-label="${op}">${op}</button>`).join('')}
       </div>
     `;
     corpo.appendChild(wrap);
   
     wrap.querySelectorAll('.qd-btn').forEach(btn => {
       btn.addEventListener('click', () => {
         const ok = btn.dataset.nome === alvo;
         wrap.querySelectorAll('.qd-btn').forEach(b => {
           b.disabled = true;
           if (b.dataset.nome === alvo) b.classList.add('correta');
         });
         if (!ok) btn.classList.add('errada');
         mostrarFeedbackMG(ok);
       });
     });
   }
   
   // ─── 9. ORDENAR PASSOS ──────────────────────────────────────────────────────
   
  function renderOrdenarPassos(h, corpo, spec) {
     // Extrai uma frase completa e com sentido de cada fase (sem truncar)
     function extrairFraseCompleta(fase, fallbackIdx) {
       const txt = fase.texto.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
       const frases = txt.match(/[^.!?]+[.!?]+/g) || [txt];
       // Prefere frases na faixa ideal de tamanho
       const ideal = frases.find(f => f.trim().length >= 40 && f.trim().length <= 120);
       if (ideal) return ideal.trim();
       // Fallback: maior frase disponível, sem truncar
       const maior = frases.slice().sort((a, b) => b.length - a.length)[0];
       return (maior || txt).trim() || `Evento ${fallbackIdx + 1}`;
     }
 
    let passos;
    if (spec && Array.isArray(spec.passos) && spec.passos.length >= 3) {
      passos = spec.passos.map((txt, i) => ({ id: i, texto: String(txt) }));
    } else {
      const fasesUsadas = h.fases.length > 5 ? h.fases.slice(0, 5) : h.fases;
      passos = fasesUsadas.map((f, i) => ({
        id: i,
        texto: extrairFraseCompleta(f, i)
      }));
    }
     let ordem = embaralhar([...passos.map((_, i) => i)]);
   
     const wrap = document.createElement('div');
     wrap.innerHTML = `
       <p class="mg-desc">Use as setas ↑↓ para colocar os eventos da história na ordem correta!</p>
       <ul class="op-lista" id="opLista"></ul>
       <button class="btn-confirmar" id="btnConfOP" style="margin-top:12px;width:100%">✔ Confirmar Ordem</button>
     `;
     corpo.appendChild(wrap);
   
     function renderLista() {
       const lista = document.getElementById('opLista');
       lista.innerHTML = ordem.map((id, i) => `
         <li class="op-item">
           <span class="op-num">${i + 1}</span>
           <span class="op-texto">${passos[id].texto}</span>
           <div class="op-setas">
             <button class="op-seta" data-action="up"   data-i="${i}" aria-label="Mover para cima"  ${i === 0                ? 'disabled' : ''}>↑</button>
             <button class="op-seta" data-action="down" data-i="${i}" aria-label="Mover para baixo" ${i === ordem.length - 1 ? 'disabled' : ''}>↓</button>
           </div>
         </li>
       `).join('');
   
       lista.querySelectorAll('.op-seta').forEach(btn => {
         btn.addEventListener('click', () => {
           const i = parseInt(btn.dataset.i);
           if (btn.dataset.action === 'up' && i > 0) {
             [ordem[i], ordem[i-1]] = [ordem[i-1], ordem[i]];
           } else if (btn.dataset.action === 'down' && i < ordem.length - 1) {
             [ordem[i], ordem[i+1]] = [ordem[i+1], ordem[i]];
           }
           renderLista();
         });
       });
     }
     renderLista();
   
     document.getElementById('btnConfOP').addEventListener('click', () => {
       const correta = passos.map((_, i) => i);
       const ok = JSON.stringify(ordem) === JSON.stringify(correta);
       ordem = [...correta];
       renderLista();
       document.querySelectorAll('.op-item').forEach(li => li.classList.add('correta'));
       document.querySelectorAll('.op-seta').forEach(b => b.disabled = true);
       document.getElementById('btnConfOP').disabled = true;
       registrarEventoMG('ordenar_passos', ok ? 'acerto' : 'erro');
       mostrarFeedbackMG(ok);
     });
   }
   
   // ─── TTS helper ─────────────────────────────────────────────────────────────
   
   function falarTexto(texto) {
     if (!('speechSynthesis' in window)) return;
     window.speechSynthesis.cancel();
     const utt = new SpeechSynthesisUtterance(texto.replace(/<[^>]*>/g,''));
     utt.lang = 'pt-BR'; utt.rate = 0.85; utt.pitch = 1.1;
     window.speechSynthesis.speak(utt);
   }
   
   // =============================================
   // 13. RESULTADO
   // =============================================
   
   function mostrarResultado(estrelas, tempo, acertos) {
     irParaTela('resultado');
   
     document.getElementById('resultado-estrelas').innerHTML = renderEstrelas(estrelas, 3);
     const msgs = MSGS_RESULTADO[estrelas] || MSGS_RESULTADO[0];
     const msg = msgs[Math.floor(Math.random() * msgs.length)];
     const titulos = {
       0: 'Tente Novamente!',
       1: 'História Concluída!',
       2: 'Muito Bem!',
       3: 'Perfeito!'
     };
     document.getElementById('resultado-titulo').textContent = titulos[estrelas] || titulos[0];
     document.getElementById('resultado-msg').textContent = msg;
     document.getElementById('stat-tempo').textContent = tempo + ' min';
     document.getElementById('stat-acertos').textContent = acertos;
     document.getElementById('stat-nivel').textContent = labelNivel(estado.nivel).replace(/[^\w\s]/g,'').trim();
   
     // Controlar visibilidade dos botões conforme estrelas
     const btnRefazer = document.getElementById('btn-refazer-atividade');
     const btnJogar   = document.getElementById('btn-jogar-novamente');
     const btnProg    = document.getElementById('btn-ver-progresso');
     const aviso      = document.getElementById('resultado-aviso');
   
     if (estrelas === 0) {
       // 0 estrelas → obrigatório refazer
       btnRefazer.style.display = 'block';
       btnJogar.style.display   = 'none';
       btnProg.style.display    = 'none';
       aviso.classList.remove('oculto');
     } else {
       // 1+ estrelas → mostra todos os botões
       btnRefazer.style.display = 'block';
       btnJogar.style.display   = 'block';
       btnProg.style.display    = 'block';
       aviso.classList.add('oculto');
     }
   }
   
   function refazerAtividade() {
     const h = estado.historiaAtual;
     if (!h) { irParaTela('biblioteca'); return; }
     // Reinicia o estado da atividade atual
     estado.faseAtual     = 0;
     estado.acertos       = 0;
     estado.ajudas        = 0;
     estado.minigameAtual = 0;
     estado.mgAcertos     = 0;
     estado.iniciouEm     = Date.now();
     estado.minigamesPreset = null;
     // Volta para a leitura da história + minigames
     iniciarMinigames();
   }
   
   // =============================================
   // 14. PROGRESSO
   // =============================================
   
   function atualizarTelaProgresso() {
     const p = estado.perfil;
     document.getElementById('pp-avatar').textContent = p.avatar;
     document.getElementById('pp-nome').textContent = p.nome;
     document.getElementById('pp-nivel-badge').textContent = labelNivel(estado.nivel);
     document.getElementById('pp-total').textContent = estado.totalEstrelas + ' ⭐';
    const acertosMG = (estado.relatorioEventos || []).filter(e => e.acao === 'acerto').length;
    const errosMG = (estado.relatorioEventos || []).filter(e => e.acao === 'erro').length;
    const naoOuco = (estado.relatorioEventos || []).filter(e => e.acao === 'nao_consigo_ouvir').length;
     document.getElementById('progresso-sub').textContent =
      `Olá, ${p.nome}! Você tem ${estado.experiencia || 0} XP — continue com calma, cada fase conta!`;
   
     atualizarBarraExperiencia();
   
     // Histórias concluídas
     const cont = document.getElementById('historias-concluidas');
     cont.innerHTML = '';
     if (estado.historiasLidas.length === 0) {
       cont.innerHTML = '<p class="vazio-msg">Nenhuma história concluída ainda. Comece a ler! 📚</p>';
     } else {
       estado.historiasLidas.forEach(r => {
         const h = HISTORIAS.find(x => x.id === r.id);
         if (!h) return;
         const item = document.createElement('div');
         item.className = 'historia-concluida-item';
         item.innerHTML = `
           <div class="hci-esq">
             <span class="hci-emoji">${h.emoji}</span>
             <div class="hci-info">
               <span class="hci-titulo">${h.titulo}</span>
               <span class="hci-genero">${labelGenero(h.genero)} · ${r.data || ''}</span>
             </div>
           </div>
           <span class="hci-estrelas">${renderEstrelas(r.estrelas, 3)}</span>
         `;
         cont.appendChild(item);
       });
     }
   
     // Stats
     document.getElementById('prog-historias').textContent = estado.historiasLidas.length;
     document.getElementById('prog-tempo').textContent = estado.tempoTotal + ' min';
     document.getElementById('prog-estrelas').textContent = estado.totalEstrelas;
     document.getElementById('prog-minigames').textContent = estado.minigamesJogados;

    renderizarAcessoRelatorioResponsavel({ acertosMG, errosMG, naoOuco });
   }

  function renderizarAcessoRelatorioResponsavel(metricas) {
    const secoes = document.querySelector('.progresso-secoes');
    if (!secoes) return;
    let bloco = document.getElementById('prog-extra-relatorio');
    if (!bloco) {
      bloco = document.createElement('div');
      bloco.id = 'prog-extra-relatorio';
      bloco.className = 'progresso-secao';
      secoes.appendChild(bloco);
    }

    const sessaoResponsavel = (() => {
      try {
        const raw = localStorage.getItem('mundoHistorias_responsavel_sessao');
        return raw ? JSON.parse(raw) : null;
      } catch (_) {
        return null;
      }
    })();

    if (!sessaoResponsavel || !sessaoResponsavel.email) {
      bloco.innerHTML = '';
      return;
    }

    const liberado = !!estado.relatorioResponsavelLiberado;
    if (!liberado) {
      bloco.innerHTML = `
        <h3>🔒 Área do Responsável</h3>
        <button class="btn-secundario" id="btn-libera-relatorio">Ver relatório do responsável</button>
      `;
      const btn = document.getElementById('btn-libera-relatorio');
      if (btn) {
        btn.addEventListener('click', () => {
          const a = Math.floor(Math.random() * 7) + 3;
          const b = Math.floor(Math.random() * 7) + 2;
          const resp = prompt(`Verificação parental: quanto é ${a} + ${b}?`);
          if (resp === null) return;
          if (parseInt(resp, 10) === (a + b)) {
            estado.relatorioResponsavelLiberado = true;
            salvarEstado();
            atualizarTelaProgresso();
          } else {
            mostrarToast('Verificação incorreta.');
          }
        });
      }
      return;
    }

    bloco.innerHTML = `
      <h3>📄 Relatório do Responsável</h3>
      <div class="stats-grid" id="stats-relatorio-grid">
        <div class="stat-card-prog"><span class="scp-icon">❌</span><span class="scp-valor">${estado.tentativasReprovadas || 0}</span><span class="scp-label">Tentativas reprovadas</span></div>
        <div class="stat-card-prog"><span class="scp-icon">✅</span><span class="scp-valor">${metricas.acertosMG}</span><span class="scp-label">Acertos MG</span></div>
        <div class="stat-card-prog"><span class="scp-icon">⚠️</span><span class="scp-valor">${metricas.errosMG}</span><span class="scp-label">Erros MG</span></div>
        <div class="stat-card-prog"><span class="scp-icon">🔊</span><span class="scp-valor">${metricas.naoOuco}</span><span class="scp-label">Não consigo ouvir</span></div>
      </div>
    `;
  }
   
   function niveisOrdem(n) {
     return { iniciante: 0, intermediario: 1, avancado: 2 }[n] || 0;
   }
   
   // =============================================
   // 15. INICIALIZAÇÃO GERAL
   // =============================================
   
  async function inicializar() {
     // Redireciona para login se não tiver perfil
     carregarEstado();
    if (estado.experiencia == null) estado.experiencia = 0;
    estado.nivel = calcularNivelPorXp(estado.experiencia);
    estado.relatorioResponsavelLiberado = false;
     if (!estado.perfil || !estado.perfil.nome) {
       window.location.href = 'login.html';
       return;
     }
   
    await carregarHistoriasDaApi();
    aplicarFaixaDoPerfilNosFiltros();
    // Carrega app
     atualizarHeader();
     atualizarBarraExperiencia();
     renderizarBiblioteca();
     irParaTela('biblioteca');
   
     // Filtros
     inicializarFiltros();

    const btnGerar = document.getElementById('btn-gerar-historia');
    if (btnGerar) btnGerar.addEventListener('click', () => gerarHistoriaIa().catch(() => {}));
    const btnBotIaGerar = document.getElementById('btn-bot-ia-gerar');
    if (btnBotIaGerar) btnBotIaGerar.addEventListener('click', () => gerarHistoriaBotIa().catch(() => {}));
    inicializarGeneroBotIa();
   
    carregarModoNoturno();

    // Header — acessibilidade
     document.getElementById('btn-contraste').addEventListener('click', toggleContraste);
     document.getElementById('btn-fonte-mais').addEventListener('click', () => ajustarFonte(2));
     document.getElementById('btn-fonte-menos').addEventListener('click', () => ajustarFonte(-2));
   
     // Sair (logout)
     document.getElementById('btn-sair').addEventListener('click', () => {
      if (confirm('Deseja encerrar a sessão do responsável neste dispositivo?')) {
        localStorage.removeItem('mundoHistorias_responsavel_sessao');
        localStorage.removeItem('mundoHistorias_estado');
         window.location.href = 'login.html';
       }
     });
   
     // Sidebar nav
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
   
     // Leitura
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
   
     // Minigame
     document.getElementById('btn-proximo-mg').addEventListener('click', proximoMinigame);
     document.getElementById('btn-finalizar-mg').addEventListener('click', finalizarMinigames);
     document.getElementById('btn-voltar-leitura').addEventListener('click', () => {
       if (estado.modoLeituraCompleta) mostrarLeituraCompleta();
       else { irParaTela('leitura'); renderizarFase(); }
     });
     document.getElementById('btn-pular-fase').addEventListener('click', pularFase);
     document.getElementById('btn-ouvir-mg').addEventListener('click', () => {
       const enunc = document.querySelector('#minigame-corpo .mg-enunciado');
       if (enunc) ouvirTexto(enunc.textContent);
     });
   
     // Resultado
      document.getElementById('btn-refazer-atividade').addEventListener('click', refazerAtividade);
      document.getElementById('btn-jogar-novamente').addEventListener('click', () => irParaTela('biblioteca'));
     document.getElementById('btn-ver-progresso').addEventListener('click', () => irParaTela('progresso'));
   }
   
   // Inicia quando DOM estiver pronto
   document.addEventListener('DOMContentLoaded', () => {
     injetarEstilosNovos();
     inicializar();
   });

  //  // =============================================
  //  // 16. ESTILOS DINÂMICOS — Novos componentes
  //  // =============================================
   function injetarEstilosNovos() {
     const css = `
       .ia-gerar-wrap {
         margin: 16px 0 20px;
         padding: 16px 18px;
         border-radius: 16px;
         border: 2px solid var(--borda, #E5E7EB);
         background: var(--card-bg, #fff);
         box-shadow: 0 2px 8px rgba(0,0,0,.06);
       }
       .ia-gerar-titulo { font-size: 1.1rem; margin: 0 0 6px; color: var(--texto, #1F2937); }
       .ia-gerar-sub { font-size: 0.9rem; color: #6B7280; margin: 0 0 12px; line-height: 1.45; }
       .ia-gerar-label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem; }
       .ia-gerar-textarea {
         width: 100%; box-sizing: border-box; border-radius: 12px; border: 2px solid #E5E7EB;
         padding: 10px 12px; font-family: inherit; font-size: 1rem; resize: vertical; min-height: 72px;
       }
       .ia-gerar-btn { margin-top: 12px; width: 100%; max-width: 280px; }
       .ia-gerar-erro { color: #B45309; font-size: 0.9rem; margin: 10px 0 0; }
     .bot-ia-wrap {
       padding: 10px 24px 24px;
       display: flex;
       justify-content: center;
       align-items: center;
     }
     .bot-ia-card {
       max-width: 780px;
       width: 100%;
       background: linear-gradient(180deg, #FFFFFF, #FAF7FF);
       border: 1.5px solid rgba(167,139,250,.3);
       border-radius: 20px;
       box-shadow: 0 12px 32px rgba(100,70,200,.12);
       padding: 18px;
     }
     .bot-chat {
       display: flex;
       flex-direction: column;
       gap: 10px;
       margin-bottom: 12px;
     }
     .bot-chat-msg {
       display: flex;
       align-items: flex-start;
       gap: 8px;
     }
     .bot-chat-avatar {
       width: 32px;
       height: 32px;
       border-radius: 50%;
       display: inline-flex;
       align-items: center;
       justify-content: center;
       background: #EDE9FE;
       font-size: .95rem;
       flex: 0 0 32px;
     }
     .bot-chat-bubble {
       background: #F5F3FF;
       border: 1px solid #DDD6FE;
       border-radius: 14px 14px 14px 6px;
       padding: 10px 12px;
       color: #4C1D95;
       font-weight: 600;
       line-height: 1.45;
       font-size: .92rem;
     }
     .bot-ia-genero-grupo {
       margin-bottom: 10px;
     }
      .bot-ia-label {
        display: block;
        margin-top: 8px;
        margin-bottom: 6px;
        font-weight: 700;
        font-size: .95rem;
      }
      .bot-ia-textarea {
        width: 100%;
        border: 2px solid #E5E7EB;
        border-radius: 12px;
        padding: 10px 12px;
        font-family: inherit;
        font-size: 1rem;
        resize: vertical;
      }
      .bot-ia-btn {
        margin-top: 12px;
       width: 100%;
      }
      .bot-ia-erro {
        margin-top: 10px;
        color: #B45309;
        font-size: .9rem;
        font-weight: 700;
      }
       /* ── Resumo da história ──────────────────────────── */
       .resumo-historia-wrap {
         text-align: center;
         padding: 8px 0 16px;
       }
       .resumo-cena {
         font-size: 3rem;
         margin-bottom: 8px;
         animation: pulse 1.5s ease infinite;
       }
       @keyframes pulse {
         0%,100% { transform: scale(1); }
         50% { transform: scale(1.1); }
       }
       .resumo-titulo {
         font-size: 1.25rem;
         font-weight: 700;
         color: var(--cor-primaria, #7C3AED);
         margin-bottom: 14px;
       }
       .resumo-texto {
         background: var(--card-bg, #fff);
         border: 2px solid var(--borda, #E5E7EB);
         border-radius: 16px;
         padding: 16px 18px;
         font-size: 1rem;
         line-height: 1.75;
         text-align: left;
         color: var(--texto, #1F2937);
         margin-bottom: 16px;
         box-shadow: 0 2px 8px rgba(0,0,0,.06);
       }
       .resumo-texto strong.palavra-chave {
         color: var(--cor-primaria, #7C3AED);
         font-weight: 700;
         background: rgba(124,58,237,.08);
         border-radius: 4px;
         padding: 0 3px;
       }
       .resumo-aviso {
         background: linear-gradient(135deg,#FEF9C3,#FDE68A);
         border-radius: 12px;
         padding: 10px 14px;
         font-size: .95rem;
         color: #78350F;
         margin-bottom: 16px;
       }
       .resumo-btn-iniciar {
         font-size: 1.1rem;
         padding: 14px 32px;
         border-radius: 999px;
         background: linear-gradient(135deg, var(--cor-primaria,#7C3AED), var(--cor-acento,#EC4899));
         color: #fff;
         border: none;
         cursor: pointer;
         font-weight: 700;
         box-shadow: 0 4px 16px rgba(124,58,237,.3);
         transition: transform .15s, box-shadow .15s;
       }
       .resumo-btn-iniciar:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(124,58,237,.4); }

       /* ── Texto de contexto dentro do minigame completar ── */
       .mg-texto-contexto {
         background: linear-gradient(135deg,#F5F3FF,#EDE9FE);
         border-left: 4px solid var(--cor-primaria,#7C3AED);
         border-radius: 0 12px 12px 0;
         padding: 12px 14px;
         font-size: .95rem;
         line-height: 1.7;
         color: var(--texto,#1F2937);
         margin-bottom: 14px;
       }
       .mg-texto-contexto strong.palavra-chave {
         color: var(--cor-primaria,#7C3AED);
         font-weight: 700;
       }

       /* ── Jogo da Memória ─────────────────────────────── */
       .mem-grid {
         display: grid;
         grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
         gap: 10px;
         margin: 16px 0;
       }
       .mem-card {
         height: 80px;
         perspective: 600px;
         cursor: pointer;
       }
       .mem-inner {
         position: relative;
         width: 100%;
         height: 100%;
         transition: transform .5s cubic-bezier(.4,0,.2,1);
         transform-style: preserve-3d;
       }
       .mem-card.mem-virado .mem-inner,
       .mem-card.mem-acertado .mem-inner {
         transform: rotateY(180deg);
       }
       .mem-frente, .mem-verso {
         position: absolute;
         inset: 0;
         border-radius: 14px;
         display: flex;
         align-items: center;
         justify-content: center;
         font-weight: 700;
         backface-visibility: hidden;
         -webkit-backface-visibility: hidden;
         box-shadow: 0 2px 8px rgba(0,0,0,.12);
         transition: background .3s;
       }
       .mem-frente {
         background: linear-gradient(135deg, var(--cor-primaria,#7C3AED), #A78BFA);
         color: #fff;
         font-size: 1.6rem;
         border: 3px solid rgba(255,255,255,.3);
       }
       .mem-verso {
         background: linear-gradient(135deg,#ECFDF5,#D1FAE5);
         border: 3px solid #34D399;
         color: var(--texto,#1F2937);
         font-size: 0.88rem;
         transform: rotateY(180deg);
         text-align: center;
         padding: 4px;
       }
       .mem-card.mem-acertado .mem-frente,
       .mem-card.mem-acertado .mem-verso {
         background: linear-gradient(135deg,#DCFCE7,#BBF7D0) !important;
         border-color: #22C55E !important;
         box-shadow: 0 0 0 3px rgba(34,197,94,.3);
       }
       .mem-card.mem-erro-flash .mem-inner {
         animation: erroBlink .4s ease;
       }
       @keyframes erroBlink {
         0%,100% { filter: none; }
         40% { filter: brightness(.7) saturate(0); }
       }
       .mem-status {
         text-align: center;
         font-size: .95rem;
         color: #6B7280;
         padding: 4px 0;
       }
       .mem-status strong { color: var(--cor-primaria,#7C3AED); }

       /* ── Caça-palavras melhorado ─────────────────────── */
       .cp-cel {
         display: flex;
         align-items: center;
         justify-content: center;
         border: 1px solid var(--borda,#E5E7EB);
         border-radius: 6px;
         font-weight: 700;
         cursor: pointer;
         user-select: none;
         -webkit-user-select: none;
         transition: background .1s, transform .1s, color .1s;
         background: var(--card-bg,#fff);
         color: var(--texto,#1F2937);
       }
       .cp-cel:hover {
         background: #F3F4F6;
         transform: scale(1.08);
       }
       .cp-cel.cp-sel {
         background: var(--cor-primaria,#7C3AED) !important;
         color: #fff !important;
         border-color: transparent;
         transform: scale(1.12);
       }
       .cp-cel.cp-preview {
         background: var(--preview-color, #FBBF24) !important;
         color: #1F2937 !important;
         border-color: transparent;
         transform: scale(1.07);
       }
       .cp-cel.cp-found {
         background: var(--found-color, #22C55E) !important;
         color: #fff !important;
         border-color: transparent;
         font-weight: 900;
         box-shadow: 0 1px 4px rgba(34,197,94,.4);
         cursor: default;
       }
       .cp-cel.cp-missed {
         background: #FDE68A !important;
         color: #78350F !important;
         border-color: #F59E0B;
         animation: pulseYellow .6s ease;
       }
       @keyframes pulseYellow {
         0%,100% { transform: scale(1); }
         50% { transform: scale(1.1); }
       }
       .cp-cel.cp-wrong {
         animation: shakeRed .3s ease;
         background: #FEE2E2 !important;
         color: #991B1B !important;
       }
       @keyframes shakeRed {
         0%,100% { transform: translateX(0); }
         25% { transform: translateX(-3px); }
         75% { transform: translateX(3px); }
       }
       .cp-alvo {
         display: inline-block;
         padding: 5px 12px;
         border-radius: 999px;
         border: 2px solid var(--cor-palavra, var(--cor-primaria,#7C3AED));
         color: var(--cor-palavra, var(--cor-primaria,#7C3AED));
         font-weight: 700;
         font-size: .88rem;
         margin: 3px;
         background: rgba(124,58,237,.06);
         transition: all .3s;
       }
       .cp-alvo.cp-alvo-found {
         background: var(--cor-palavra, var(--cor-primaria,#7C3AED));
         color: #fff !important;
         text-decoration: line-through;
         opacity: .8;
       }
     `;
     const style = document.createElement('style');
     style.id = 'estilos-novos-mg';
     style.textContent = css;
     document.head.appendChild(style);
   }