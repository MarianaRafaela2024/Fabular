/* =============================================
   Fabular — conteúdo dos minigames a partir da história
   ============================================= */
'use strict';

const MG_DISTRATORES_FORA = [
  'nuvem', 'pedra', 'janela', 'cadeira', 'sapato', 'caneta', 'ponte', 'farol',
  'tesoura', 'mochila', 'relógio', 'escada', 'balde', 'sino', 'trilho'
];

function textoHistoriaLimpo(h) {
  const fonte = h || (typeof estado !== 'undefined' ? estado.historiaAtual : null);
  if (typeof obterTextoBaseHistoria === 'function') {
    return String(obterTextoBaseHistoria(fonte) || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return String(fonte?.texto || fonte?.textoCompleto || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function frasesHistoria(h) {
  return textoHistoriaLimpo(h)
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12 && s.length <= 160);
}

function palavrasRelevantesHistoria(h) {
  const STOP = new Set([
    'para', 'como', 'mais', 'pela', 'pelo', 'esse', 'essa', 'isso', 'uma', 'uns',
    'umas', 'são', 'está', 'este', 'esta', 'aqui', 'onde', 'quando', 'então',
    'muito', 'também', 'assim', 'fazer', 'pode', 'com', 'que', 'não', 'nao',
    'mas', 'por', 'foi', 'ser', 'tem', 'seu', 'sua', 'nos', 'nas', 'dos', 'das',
    'ele', 'ela', 'tinha', 'dele', 'dela', 'depois', 'antes', 'ainda', 'todo',
    'toda', 'entre', 'sobre', 'seus', 'suas', 'era', 'foram', 'eles', 'elas'
  ]);
  const hst = h || estado?.historiaAtual;
  const chave = (hst?.palavrasChave || []).map((p) => String(p || '').trim()).filter((p) => p.length >= 3);
  const freq = {};
  textoHistoriaLimpo(hst).split(/\s+/)
    .map((p) => p.replace(/[^a-zA-ZÀ-ú]/g, ''))
    .filter((p) => p.length >= 4 && !STOP.has(p.toLowerCase()))
    .forEach((p) => {
      const k = p.toLowerCase();
      freq[k] = (freq[k] || 0) + 1;
    });
  const porFreq = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([p]) => p);
  const juntas = [];
  const visto = new Set();
  [...chave, ...porFreq].forEach((p) => {
    const k = p.toLowerCase();
    if (visto.has(k)) return;
    visto.add(k);
    juntas.push(p);
  });
  return juntas;
}

function palavraEstaNoTexto(palavra, h) {
  const txt = textoHistoriaLimpo(h).toLowerCase();
  const p = String(palavra || '').toLowerCase().replace(/[^a-zà-ú]/g, '');
  if (!p) return false;
  return new RegExp(`\\b${p.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i').test(txt);
}

function distratoresForaDaHistoria(h, qtd, evitar) {
  const ev = new Set((evitar || []).map((p) => String(p).toLowerCase()));
  const pool = MG_DISTRATORES_FORA.filter((p) => !ev.has(p) && !palavraEstaNoTexto(p, h));
  const extra = palavrasRelevantesHistoria(h).filter((p) => !ev.has(String(p).toLowerCase()));
  const lista = pool.length >= qtd ? pool : [...pool, 'mapa', 'piano', 'tigre', 'anel'];
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, qtd);
}

const MG_PERGUNTAS_HISTORIA = {
  n1: {
    pergunta: 'Qual era o grande segredo de Léo, o leão?',
    correta: 'Ele tinha medo do escuro quando a noite chegava',
    distratores: [
      'Ele não sabia rugir alto com os outros animais',
      'Ele não gostava de brincar com a zebra e o macaco'
    ]
  },
  n2: {
    pergunta: 'O que Marina colecionava em seu caderno azul?',
    correta: 'Desenhos dos formatos curiosos das nuvens que via no céu',
    distratores: [
      'Folhas secas e flores coloridas coladas das árvores',
      'Moedas antigas e carimbos de outros países'
    ]
  },
  n3: {
    pergunta: 'O que os livros brilhantes guardavam na biblioteca secreta?',
    correta: 'Histórias verdadeiras que precisavam ser lidas para não desaparecer',
    distratores: [
      'Fórmulas científicas para inventar máquinas do futuro',
      'Mapas antigos de ilhas escondidas com tesouros de piratas'
    ]
  },
  p1: {
    pergunta: 'No poema "A Chuva Cantando", como o personagem se diverte com a chuva?',
    correta: 'Saindo de guarda-chuva para pular nas poças de água da rua',
    distratores: [
      'Ficando dormindo sob as cobertas até a tempestade passar',
      'Desenhando a chuva no papel sentado dentro de casa'
    ]
  },
  p2: {
    pergunta: 'No poema "Palavras que Voam", com o que as palavras lidas são comparadas?',
    correta: 'Com pássaros que ganham asas ao serem lidas e voam até as casas',
    distratores: [
      'Com estrelas que piscam bem alto no céu à noite',
      'Com peixes coloridos que nadam velozes no oceano'
    ]
  },
  i1: {
    pergunta: 'Qual é o objetivo principal das instruções para a casinha de pássaros?',
    correta: 'Construir um lar acolhedor para os passarinhos do jardim',
    distratores: [
      'Fazer um brinquedo com rodas para rolar no chão',
      'Montar um barco de madeira para navegar na lagoa'
    ]
  },
  i2: {
    pergunta: 'O que é fundamental ao preparar uma cápsula do tempo?',
    correta: 'Reunir cartas e objetos simbólicos com honestidade para o futuro',
    distratores: [
      'Comprar objetos muito caros para mostrar riqueza',
      'Guardar alimentos perecíveis para provar depois de dez anos'
    ]
  },
  d1: {
    pergunta: 'Quais detalhes visuais se destacam na descrição do fundo do mar?',
    correta: 'A luz filtrada pela água e a variedade de corais e peixes vibrantes',
    distratores: [
      'Uma rua movimentada cheia de carros e barulho de buzinas',
      'Uma floresta fria com neve caindo sobre os pinheiros'
    ]
  },
  d2: {
    pergunta: 'Como o jardim da vovó é caracterizado no texto descritivo?',
    correta: 'Um ambiente alegre, florido, cheiroso, colorido e tranquilo',
    distratores: [
      'Um deserto quente, seco e sem nenhuma flor',
      'Um galpão escuro cheio de caixas de papelão'
    ]
  },
  inf1: {
    pergunta: 'Segundo o texto informativo, por que o céu aparece azul durante o dia?',
    correta: 'Porque a luz azul do Sol é espalhada pelas partículas da atmosfera',
    distratores: [
      'Porque a água dos oceanos é refletida diretamente no céu',
      'Porque as nuvens absorvem a luz amarela e soltam a tinta azul'
    ]
  },
  inf2: {
    pergunta: 'Por que a Floresta Amazônica é chamada de "pulmão do mundo"?',
    correta: 'Porque suas árvores absorvem dióxido de carbono e liberam oxigênio',
    distratores: [
      'Porque ela sopra ventos fortes para todos os outros continentes',
      'Porque é o único lugar do planeta onde chove todos os dias'
    ]
  }
};

function embaralharListaMG(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function montarEscolhaDaHistoria(h, spec, nOpcoes) {
  const qtd = Math.max(2, Math.min(4, nOpcoes || 3));
  if (spec && spec.pergunta && Array.isArray(spec.opcoes) && spec.opcoes.length >= 2) {
    const generica = spec.opcoes.some((op) => /op[cç][aã]o\s*[ab1]/i.test(String(op)));
    if (!generica) {
      const opsFull = spec.opcoes.map(String);
      const idxCorreta = typeof spec.correta === 'number' ? spec.correta : 0;
      const corretaTxt = opsFull[idxCorreta] || opsFull[0];
      const outros = opsFull.filter((_, i) => i !== idxCorreta).slice(0, qtd - 1);
      const itens = embaralharListaMG([
        { texto: corretaTxt, correta: true },
        ...outros.map((t) => ({ texto: t, correta: false }))
      ]);
      return {
        pergunta: String(spec.pergunta),
        opcoes: itens.map((i) => i.texto),
        correta: itens.findIndex((i) => i.correta),
        ok: true
      };
    }
  }

  const predef = h && MG_PERGUNTAS_HISTORIA[h.id];
  if (predef) {
    const itens = embaralharListaMG([
      { texto: predef.correta, correta: true },
      ...predef.distratores.slice(0, qtd - 1).map((d) => ({ texto: d, correta: false }))
    ]).slice(0, qtd);
    return {
      ok: true,
      pergunta: predef.pergunta,
      opcoes: itens.map((i) => i.texto),
      correta: itens.findIndex((i) => i.correta)
    };
  }

  const palavras = palavrasRelevantesHistoria(h);
  const alvo = palavras[0];
  if (!alvo) return { ok: false };

  const titulo = (h && h.titulo) ? String(h.titulo) : 'esta história';
  const distratores = distratoresForaDaHistoria(h, qtd - 1, [alvo]);
  const itens = [{ texto: alvo, correta: true }].concat(distratores.map((d) => ({ texto: d, correta: false })));
  for (let i = itens.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [itens[i], itens[j]] = [itens[j], itens[i]];
  }
  return {
    ok: true,
    pergunta: `Qual destas palavras aparece em “${titulo}”?`,
    opcoes: itens.map((i) => i.texto),
    correta: itens.findIndex((i) => i.correta)
  };
}

function montarColorirDaHistoria(h, spec, nAlvo) {
  const palavras = palavrasRelevantesHistoria(h).slice(0, Math.max(2, nAlvo || 3));
  const alvo = (spec && Array.isArray(spec.palavrasAlvo) && spec.palavrasAlvo.length)
    ? spec.palavrasAlvo.map(String)
    : palavras;
  if (!alvo.length) return { ok: false };
  const distratoras = (spec && Array.isArray(spec.distratoras) && spec.distratoras.length)
    ? spec.distratoras.map(String)
    : distratoresForaDaHistoria(h, 3, alvo);
  return { ok: true, alvo, distratoras };
}

function podeMontarPayload(tipo, h, spec) {
  const t = typeof normalizarTipoMinigame === 'function' ? normalizarTipoMinigame(tipo) : tipo;
  const txt = textoHistoriaLimpo(h);
  const palavras = palavrasRelevantesHistoria(h);
  if (spec && spec.pergunta && (spec.opcoes || spec.afirmacao || spec.resposta || spec.pares)) return true;
  if (t === 'escolha') return palavras.length >= 1;
  if (t === 'completar' || t === 'palavras_perdidas') return txt.length >= 20 && palavras.length >= 1;
  if (t === 'jogo_memoria') return palavras.length >= 2 || (spec && Array.isArray(spec.pares) && spec.pares.length >= 2);
  if (t === 'som_palavra') return palavras.length >= 1;
  if (t === 'colorir') return palavras.length >= 2;
  if (t === 'caca_palavras') return palavras.length >= 2;
  if (t === 'ordenar_passos') return frasesHistoria(h).length >= 3 || (Array.isArray(h?.fases) && h.fases.length >= 3);
  if (t === 'verdadeiro_falso') return txt.length >= 20;
  return txt.length >= 12;
}

function proximoTipoDisponivel(tipoAtual) {
  const usados = new Set((estado.minigamesLista || []).map((t) => (
    typeof chaveUnicaMinigame === 'function' ? chaveUnicaMinigame(t) : t
  )));
  const pool = (typeof BANCO_MINIGAMES !== 'undefined' && BANCO_MINIGAMES.TODOS)
    ? BANCO_MINIGAMES.TODOS
    : ['verdadeiro_falso', 'escolha', 'completar', 'jogo_memoria', 'monta_frase'];
  return pool.find((t) => {
    const ch = typeof chaveUnicaMinigame === 'function' ? chaveUnicaMinigame(t) : t;
    return !usados.has(ch) && ch !== (typeof chaveUnicaMinigame === 'function' ? chaveUnicaMinigame(tipoAtual) : tipoAtual);
  }) || null;
}
