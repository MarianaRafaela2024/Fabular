-- Install do zero (DROP + CREATE + seed). APAGA TODOS OS DADOS.
-- Banco já existente: aplicar scripts em backend/migrations/ (nunca reexecute este arquivo).

SET NOCOUNT ON;

USE Fabular;
GO

IF OBJECT_ID('Evento_Minigame') IS NOT NULL DROP TABLE Evento_Minigame;
IF OBJECT_ID('Relatorio_Crianca') IS NOT NULL DROP TABLE Relatorio_Crianca;
IF OBJECT_ID('Sessao_Leitura') IS NOT NULL DROP TABLE Sessao_Leitura;
IF OBJECT_ID('IA_Geracao') IS NOT NULL DROP TABLE IA_Geracao;
IF OBJECT_ID('Historia_Minigame') IS NOT NULL DROP TABLE Historia_Minigame;
IF OBJECT_ID('Sincronizacao_Progresso') IS NOT NULL DROP TABLE Sincronizacao_Progresso;
IF OBJECT_ID('Atividade_Diaria') IS NOT NULL DROP TABLE Atividade_Diaria;
IF OBJECT_ID('Responsavel_Crianca') IS NOT NULL DROP TABLE Responsavel_Crianca;
IF OBJECT_ID('Historia') IS NOT NULL DROP TABLE Historia;
IF OBJECT_ID('Crianca') IS NOT NULL DROP TABLE Crianca;
IF OBJECT_ID('Responsavel') IS NOT NULL DROP TABLE Responsavel;
IF OBJECT_ID('Genero') IS NOT NULL DROP TABLE Genero;

CREATE TABLE Genero (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(50) NOT NULL UNIQUE,
    Slug NVARCHAR(40) NOT NULL,
    CONSTRAINT UQ_Genero_Slug UNIQUE (Slug)
);

CREATE TABLE Responsavel (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(80) NOT NULL,
    Sobrenome NVARCHAR(80) NULL,
    Telefone VARCHAR(20) NULL,
    Email VARCHAR(160) NOT NULL UNIQUE,
    SenhaHash VARCHAR(255) NOT NULL,
    CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Crianca (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(80) NOT NULL,
    FaixaEtaria TINYINT NOT NULL CHECK (FaixaEtaria IN (1,2,3)),
    DataNascimento DATE NULL,
    Avatar VARCHAR(32) NULL,
    GeneroFavorito VARCHAR(32) NULL,
    Id_GeneroFavorito INT NULL,
    HorarioBrincar VARCHAR(10) NULL,
    Estrela SMALLINT NOT NULL DEFAULT 0,
    LocalChildKey VARCHAR(80) NULL,
    CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Crianca_GeneroFavorito FOREIGN KEY (Id_GeneroFavorito) REFERENCES Genero(Id)
);

CREATE TABLE Responsavel_Crianca (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Id_Responsavel INT NOT NULL,
    Id_Crianca INT NOT NULL,
    CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_RC_Responsavel FOREIGN KEY (Id_Responsavel) REFERENCES Responsavel(Id) ON DELETE CASCADE,
    CONSTRAINT FK_RC_Crianca FOREIGN KEY (Id_Crianca) REFERENCES Crianca(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_RC UNIQUE (Id_Responsavel, Id_Crianca)
);

CREATE TABLE Historia (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Origem VARCHAR(20) NOT NULL CHECK (Origem IN ('manual','ia')),
    Titulo NVARCHAR(180) NOT NULL,
    Genero VARCHAR(40) NOT NULL,
    FaixaEtaria TINYINT NOT NULL CHECK (FaixaEtaria IN (1,2,3)),
    Duracao NVARCHAR(30) NULL,
    Emoji NVARCHAR(20) NULL,
    Cena NVARCHAR(40) NULL,
    TextoHtml NVARCHAR(MAX) NOT NULL,
    PalavrasChaveJson NVARCHAR(MAX) NULL,
    PayloadJson NVARCHAR(MAX) NULL,
    Id_Genero INT NULL,
    CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Historia_Genero FOREIGN KEY (Id_Genero) REFERENCES Genero(Id)
);

CREATE TABLE Historia_Minigame (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Id_Historia INT NOT NULL,
    Ordem TINYINT NOT NULL,
    Tipo VARCHAR(40) NOT NULL,
    DadosJson NVARCHAR(MAX) NOT NULL,
    CONSTRAINT FK_HM_Historia FOREIGN KEY (Id_Historia) REFERENCES Historia(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_HM UNIQUE (Id_Historia, Ordem)
);

CREATE TABLE IA_Geracao (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Id_Crianca INT NOT NULL,
    Id_Historia INT NULL,
    PromptCrianca NVARCHAR(MAX) NOT NULL,
    ContextoJson NVARCHAR(MAX) NULL,
    Modelo NVARCHAR(80) NOT NULL,
    PayloadRespostaJson NVARCHAR(MAX) NOT NULL,
    CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_IAG_Crianca FOREIGN KEY (Id_Crianca) REFERENCES Crianca(Id),
    CONSTRAINT FK_IAG_Historia FOREIGN KEY (Id_Historia) REFERENCES Historia(Id)
);

CREATE TABLE Sessao_Leitura (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Id_Crianca INT NOT NULL,
    Id_Historia INT NOT NULL,
    Estrelas TINYINT NOT NULL DEFAULT 1,
    AcertosTotal INT NOT NULL DEFAULT 0,
    ErrosTotal INT NOT NULL DEFAULT 0,
    AjudasTotal INT NOT NULL DEFAULT 0,
    Concluida BIT NOT NULL DEFAULT 0,
    CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_SL_Crianca FOREIGN KEY (Id_Crianca) REFERENCES Crianca(Id),
    CONSTRAINT FK_SL_Historia FOREIGN KEY (Id_Historia) REFERENCES Historia(Id)
);

CREATE TABLE Relatorio_Crianca (
    Id_Crianca INT NOT NULL PRIMARY KEY,
    HistoriasConcluidasJson NVARCHAR(MAX) NULL,
    TentativasReprovadas INT NOT NULL DEFAULT 0,
    AcertosMG INT NOT NULL DEFAULT 0,
    ErrosMG INT NOT NULL DEFAULT 0,
    NaoConsigoOuvir INT NOT NULL DEFAULT 0,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_RelCrianca_Crianca FOREIGN KEY (Id_Crianca) REFERENCES Crianca(Id) ON DELETE CASCADE
);

CREATE TABLE Evento_Minigame (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Id_SessaoLeitura INT NOT NULL,
    Tipo VARCHAR(40) NOT NULL,
    Acao VARCHAR(40) NOT NULL,
    DadosJson NVARCHAR(MAX) NULL,
    CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_EM_SL FOREIGN KEY (Id_SessaoLeitura) REFERENCES Sessao_Leitura(Id) ON DELETE CASCADE
);

CREATE TABLE Sincronizacao_Progresso (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Id_Responsavel INT NOT NULL,
    Id_Crianca INT NOT NULL,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL,
    CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_SP_Responsavel FOREIGN KEY (Id_Responsavel) REFERENCES Responsavel(Id),
    CONSTRAINT FK_SP_Crianca FOREIGN KEY (Id_Crianca) REFERENCES Crianca(Id)
);

CREATE TABLE Atividade_Diaria (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Id_Crianca INT NOT NULL,
    Id_Historia INT NULL,
    Data DATE NOT NULL,
    HistoriasConcluidas INT NOT NULL DEFAULT 1,
    CONSTRAINT FK_AD_Crianca FOREIGN KEY (Id_Crianca) REFERENCES Crianca(Id) ON DELETE CASCADE,
    CONSTRAINT FK_AD_Historia FOREIGN KEY (Id_Historia) REFERENCES Historia(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_AD_CriancaHistoriaData UNIQUE (Id_Crianca, Id_Historia, Data)
);

CREATE INDEX IX_Responsavel_Email ON Responsavel(Email);
CREATE INDEX IX_Crianca_LocalKey ON Crianca(LocalChildKey);
CREATE INDEX IX_Historia_FaixaGenero ON Historia(FaixaEtaria, Genero);
CREATE INDEX IX_SL_Crianca ON Sessao_Leitura(Id_Crianca, CriadoEm DESC);
CREATE INDEX IX_SP_ResponsavelCrianca ON Sincronizacao_Progresso(Id_Responsavel, Id_Crianca, UpdatedAt DESC);
CREATE INDEX IX_AD_CriancaData ON Atividade_Diaria(Id_Crianca, Data DESC);
CREATE INDEX IX_IAG_Historia ON IA_Geracao(Id_Historia);
CREATE INDEX IX_IAG_Crianca ON IA_Geracao(Id_Crianca, CriadoEm DESC);
CREATE INDEX IX_EM_Sessao ON Evento_Minigame(Id_SessaoLeitura);

INSERT INTO Genero (Nome, Slug) VALUES
    ('Narrativo', 'narrativo'),
    ('Poetico', 'poetico'),
    ('Instrucional', 'instrucional'),
    ('Descritivo', 'descritivo'),
    ('Informativo', 'informativo');
-- ============================================================
-- Seed de historias (conteudo estatico migrado do array JS)
-- ============================================================
-- Script de inserção das histórias corrigidas conforme regras de faixa etária/gênero textual
-- Gerado automaticamente a partir do conteúdo revisado

INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson)
VALUES ('manual', N'O Leão que Tinha Medo do Escuro', N'Narrativo', 1, N'5 min', N'🦁', N'🌙🦁🌳', N'Era uma vez um <strong class="palavra-chave">leão</strong> chamado <strong class="palavra-chave">Léo</strong>. Ele morava numa <strong class="palavra-chave">floresta</strong> verde e bonita. Léo era grande e forte. Todo mundo achava que ele não tinha medo de nada. Mas Léo tinha um segredo… De <strong class="palavra-chave">dia</strong>, Léo brincava com os amigos. Ele corria, pulava e rugia bem alto. Mas quando o <strong class="palavra-chave">sol</strong> ia embora, Léo ficava quietinho. A noite chegava. O escuro chegava. E Léo corria se esconder atrás de uma pedra grande. Os amigos perguntavam: "Léo, onde você está?" A <strong class="palavra-chave">zebra</strong>, o <strong class="palavra-chave">elefante</strong> e o <strong class="palavra-chave">macaco</strong> procuravam por ele. Léo não respondia. Ele fechava os olhos e esperava o dia voltar. Uma noite, a <strong class="palavra-chave">lua</strong> apareceu bem grande no céu. Ela disse com voz mansa: "Léo, não tenha medo! Eu fico aqui com você toda noite." Léo olhou para o céu. Viu a lua brilhando. Viu as estrelas piscando. E sorriu. Dali em diante, Léo não tinha mais medo. Toda noite ele olhava para a lua e se sentia <strong class="palavra-chave">corajoso</strong>. Ele chamava os amigos para brincar à luz das estrelas. A noite virou a hora favorita de Léo!', N'["leão", "floresta", "noite", "lua", "corajoso"]', N'{"idOriginal": "n1", "fases": [{"texto": "Era uma vez um <strong class=\"palavra-chave\">leão</strong> chamado <strong class=\"palavra-chave\">Léo</strong>. Ele morava numa <strong class=\"palavra-chave\">floresta</strong> verde e bonita. Léo era grande e forte. Todo mundo achava que ele não tinha medo de nada. Mas Léo tinha um segredo…"}, {"texto": "De <strong class=\"palavra-chave\">dia</strong>, Léo brincava com os amigos. Ele corria, pulava e rugia bem alto. Mas quando o <strong class=\"palavra-chave\">sol</strong> ia embora, Léo ficava quietinho. A noite chegava. O escuro chegava. E Léo corria se esconder atrás de uma pedra grande."}, {"texto": "Os amigos perguntavam: \"Léo, onde você está?\" A <strong class=\"palavra-chave\">zebra</strong>, o <strong class=\"palavra-chave\">elefante</strong> e o <strong class=\"palavra-chave\">macaco</strong> procuravam por ele. Léo não respondia. Ele fechava os olhos e esperava o dia voltar."}, {"texto": "Uma noite, a <strong class=\"palavra-chave\">lua</strong> apareceu bem grande no céu. Ela disse com voz mansa: \"Léo, não tenha medo! Eu fico aqui com você toda noite.\" Léo olhou para o céu. Viu a lua brilhando. Viu as estrelas piscando. E sorriu."}, {"texto": "Dali em diante, Léo não tinha mais medo. Toda noite ele olhava para a lua e se sentia <strong class=\"palavra-chave\">corajoso</strong>. Ele chamava os amigos para brincar à luz das estrelas. A noite virou a hora favorita de Léo!"}]}');
GO

INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson)
VALUES ('manual', N'A Menina que Colecionava Nuvens', N'Narrativo', 2, N'8 min', N'☁️', N'☁️👧🌈', N'Marina tinha um hobby que ninguém mais tinha: ela <strong class="palavra-chave">colecionava nuvens</strong>. Não as nuvens de verdade, claro — essas não dá para guardar numa caixa. Marina colecionava os <strong class="palavra-chave">desenhos</strong> dela. Toda manhã, antes do café, ela corria para a janela do seu quarto e ficava olhando o céu por alguns minutos. Se a nuvem tinha um formato interessante, ela pegava o caderno azul e desenhava com cuidado. Já eram mais de cem desenhos. Cada um tinha um nome diferente, escolhido por ela. Havia a nuvem "Baleia Voadora", a "Bota do Gigante" e até uma chamada "Avó Dormindo". Os colegas da escola achavam graça. "Nuvens? Mas elas somem!", diziam. Marina só dava de ombros. Ela sabia que justamente por isso eram especiais: cada nuvem existia <strong class="palavra-chave">uma única vez</strong>. Nenhuma voltava igual. Numa terça-feira de outubro, uma nuvem diferente de todas apareceu no céu. Era enorme, escura nas bordas, mas com o centro branco e brilhante. E o formato… era de um <strong class="palavra-chave">dragão</strong>. Tinha pescoço longo, asas abertas e até o que parecia ser fogo saindo da boca. Marina ficou paralisada. Era a nuvem mais incrível que ela já tinha visto. Ela correu para pegar o caderno — mas quando voltou, a nuvem já estava mudando. O pescoço virou uma colina. As asas viraram ondas. Marina sentiu um aperto no peito. Então lembrou: o celular! Ela fotografou o que restava da nuvem-dragão. Não era perfeito, mas dava para ver um pouco das asas ainda abertas. Um mês depois, Marina olhou pela janela e não acreditou: o <strong class="palavra-chave">dragão</strong> tinha voltado! Igual. Com pescoço longo, asas e tudo. Ela correu com o caderno e dessa vez desenhou tudo, com calma. E no mês seguinte, voltou de novo. E no outro também. Marina descobriu que aquela nuvem aparecia sempre que o vento vinha do sul. Ela deu um nome para ela: <strong class="palavra-chave">Fogo</strong>. E toda vez que Fogo aparecia, Marina sabia: ia ser um dia especial!', N'["colecionava", "nuvens", "desenhos", "dragão", "Fogo"]', N'{"idOriginal": "n2", "fases": [{"texto": "Marina tinha um hobby que ninguém mais tinha: ela <strong class=\"palavra-chave\">colecionava nuvens</strong>. Não as nuvens de verdade, claro — essas não dá para guardar numa caixa. Marina colecionava os <strong class=\"palavra-chave\">desenhos</strong> dela. Toda manhã, antes do café, ela corria para a janela do seu quarto e ficava olhando o céu por alguns minutos. Se a nuvem tinha um formato interessante, ela pegava o caderno azul e desenhava com cuidado. Já eram mais de cem desenhos. Cada um tinha um nome diferente, escolhido por ela."}, {"texto": "Havia a nuvem \"Baleia Voadora\", a \"Bota do Gigante\" e até uma chamada \"Avó Dormindo\". Os colegas da escola achavam graça. \"Nuvens? Mas elas somem!\", diziam. Marina só dava de ombros. Ela sabia que justamente por isso eram especiais: cada nuvem existia <strong class=\"palavra-chave\">uma única vez</strong>. Nenhuma voltava igual."}, {"texto": "Numa terça-feira de outubro, uma nuvem diferente de todas apareceu no céu. Era enorme, escura nas bordas, mas com o centro branco e brilhante. E o formato… era de um <strong class=\"palavra-chave\">dragão</strong>. Tinha pescoço longo, asas abertas e até o que parecia ser fogo saindo da boca. Marina ficou paralisada. Era a nuvem mais incrível que ela já tinha visto."}, {"texto": "Ela correu para pegar o caderno — mas quando voltou, a nuvem já estava mudando. O pescoço virou uma colina. As asas viraram ondas. Marina sentiu um aperto no peito. Então lembrou: o celular! Ela fotografou o que restava da nuvem-dragão. Não era perfeito, mas dava para ver um pouco das asas ainda abertas."}, {"texto": "Um mês depois, Marina olhou pela janela e não acreditou: o <strong class=\"palavra-chave\">dragão</strong> tinha voltado! Igual. Com pescoço longo, asas e tudo. Ela correu com o caderno e dessa vez desenhou tudo, com calma. E no mês seguinte, voltou de novo. E no outro também. Marina descobriu que aquela nuvem aparecia sempre que o vento vinha do sul. Ela deu um nome para ela: <strong class=\"palavra-chave\">Fogo</strong>. E toda vez que Fogo aparecia, Marina sabia: ia ser um dia especial."}]}');
GO

INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson)
VALUES ('manual', N'O Guardião da Biblioteca Secreta', N'Narrativo', 3, N'14 min', N'📚', N'📚🔑🏛️', N'Pedro tinha o hábito de não prestar atenção nas coisas. Não por descuido, exatamente — era mais uma questão de <strong class="palavra-chave">escolha</strong>. O mundo tinha partes interessantes e partes que não valiam o espaço, e Pedro achava que sabia muito bem distinguir uma coisa da outra. A porta marrom no fundo do corredor da escola, por exemplo, claramente pertencia à segunda categoria. Era velha, sem plaquinha, sem maçaneta especial. Provavelmente um depósito de vassouras. Ele tinha passado por ela centenas de vezes sem pestanejar.<br><br>Havia, é verdade, um episódio antigo que Pedro preferia não lembrar. Quando tinha seis anos, encontrara um caderno de desenhos debaixo da cama da avó — cheio de esboços de um jardim que ela dizia ter visitado quando criança, um jardim que, segundo os adultos, nunca tinha existido de verdade. Pedro perguntara, perguntara de novo, e a resposta era sempre a mesma: invenção de velha. Com o tempo, aprendeu a lição ao contrário do que deveria: coisas estranhas eram melhor ignoradas do que investigadas. Foi assim que Pedro se tornou, aos poucos, um menino que sabia olhar para o lado sem ver.<br><br>Até aquela quinta-feira. Pedro voltava da aula de ciências com a cabeça ainda cheia de perguntas que o professor não soubera responder — ou não quisera. Ao passar pelo corredor, percebeu algo diferente: a porta estava <strong class="palavra-chave">entreaberta</strong>. Uma fresta fina. E por ela vazava uma luz que não era de lâmpada. Era dourada demais. Quente demais. Pedro parou. Olhou para os dois lados do corredor. Não havia ninguém. Ele empurrou a porta devagar.<br><br>O que havia do outro lado não cabia na lógica de um depósito de vassouras. Era uma <strong class="palavra-chave">biblioteca enorme</strong> — alta demais para caber num prédio térreo, larga demais para estar dentro da escola. As prateleiras iam do chão ao teto e se curvavam levemente, como se o cômodo fosse redondo. E os livros brilhavam. Não todos — mas muitos tinham um leve pulsar de luz na lombada, como se respirassem. Pedro sentiu que deveria ter medo. Mas o que sentiu foi outra coisa: <strong class="palavra-chave">reconhecimento</strong>. Como se aquele lugar já o esperasse há tempo. E, por um instante, pensou no caderno da avó, guardado havia anos numa caixa que ninguém mais abria.<br><br>"Você demorou." A voz veio de algum lugar entre as prateleiras. Pedro deu um passo atrás — mas não saiu. Uma <strong class="palavra-chave">raposa</strong> surgiu caminhando devagar, óculos de aros dourados equilibrados na ponta do focinho, um livro aberto na pata esquerda. Ela se sentou numa cadeira de veludo vermelho como se aquilo fosse a coisa mais natural do mundo. "Cada guardião demora um tempo diferente para encontrar a biblioteca", ela disse. "Alguns levam dias. Outros, anos. Você levou três." Pedro abriu a boca. "Três o quê?" "Anos de escola", respondeu a raposa, virando uma página.<br><br>A raposa se apresentou como Nogueira, e explicou com a paciência de quem já explicou a mesma coisa muitas vezes — e ainda assim não achava a explicação cansativa. Cada livro naquela biblioteca guardava uma <strong class="palavra-chave">história verdadeira</strong>: não necessariamente um fato histórico, mas algo que havia sido sentido de verdade por alguém, em algum lugar, em algum tempo. "Histórias verdadeiras precisam ser lidas", ela disse. "Quando ninguém lê, elas enfraquecem. A lombada perde o brilho. E quando o brilho some de vez…" Ela fechou o livro com cuidado. "A história desaparece. Como se nunca tivesse acontecido."<br><br>Pedro quis saber havia quanto tempo Nogueira era guardiã. "Guardiões não contam a própria idade", ela respondeu, com um meio sorriso que Pedro não soube decifrar. "Mas posso dizer que já vi muitos meninos como você passarem por essa porta. A maioria some depois de uma visita. Acha que sonhou. Volta para a vida de sempre e nunca mais repara em portas entreabertas." Ela olhou para ele por cima dos óculos. "Você não me parece desse tipo. Ou talvez seja. Isso, só o tempo mostra."<br><br>Pedro passou aquela tarde inteira na biblioteca. Leu sobre uma <strong class="palavra-chave">civilização</strong> que construía cidades nas copas das árvores e desapareceu antes de ser descoberta. Leu o diário de uma menina que vivia numa estação espacial e sentia saudade da chuva. Leu a história de um urso que tinha aprendido a escrever sozinho e deixado cartas escondidas em ocos de árvores pela floresta. Cada livro tinha um brilho diferente. Alguns pulsavam devagar, como coração em repouso. Outros tremiam um pouco, como se tivessem pressa de ser lidos.<br><br>Numa prateleira mais baixa, quase escondida atrás de outras, Pedro encontrou um livro fino, com a lombada quase apagada — só um fiapo de luz, tremendo fraco, prestes a se apagar de vez. Puxou-o com cuidado. Na capa, sem título, havia apenas o desenho de um jardim. Um jardim que ele reconheceu na hora, com um aperto estranho no peito: era o mesmo jardim do caderno da avó. Abriu o livro e viu, entre as páginas, a letra torta de uma menina de sete anos escrevendo sobre canteiros de flores que ninguém mais acreditava terem existido. "Essa história está quase apagando", disse Nogueira, que tinha se aproximado sem fazer barulho. "Ninguém lê há muito tempo. A senhora que viveu isso contou para poucas pessoas, e quase ninguém acreditou nela." Pedro sentiu o rosto esquentar. "Ela é minha avó", disse baixinho. "Eu não acreditei."<br><br>"Agora você pode escolher acreditar", respondeu a raposa. "Um livro não desaparece só porque foi esquecido uma vez. Ele desaparece quando é esquecido para sempre." Pedro sentou-se ali mesmo, no chão entre as prateleiras, e leu a história inteira do jardim da avó — um lugar que existira de verdade, décadas atrás, atrás de uma casa que já não existia mais, cheio de flores que ninguém sabia mais nomear. Quando terminou, a lombada do livro já brilhava um pouco mais forte.<br><br>Quando saiu, o corredor estava vazio e as luzes da escola já tinham sido apagadas. Pedro ficou parado diante da porta marrom, agora fechada de novo. Entendeu, naquele momento, o que a raposa quis dizer. Ser <strong class="palavra-chave">guardião</strong> não era uma tarefa de vigia — não era trancar a biblioteca, catalogar os livros, protegê-los do pó. Era outra coisa, mais difícil e mais simples ao mesmo tempo: era carregar as histórias dentro de si. <strong class="palavra-chave">Lembrar</strong> delas. Deixar que mudassem alguma coisa. Porque uma história só existe de verdade quando alguém a leva para fora da página.<br><br>No dia seguinte, Pedro foi visitar a avó depois da escola, pela primeira vez em meses sem que a mãe precisasse pedir. Sentou-se ao lado dela e perguntou sobre o jardim. A avó pareceu surpresa — ninguém perguntava havia tanto tempo. Começou a contar, devagar no início, depois com mais vontade, os olhos brilhando de um jeito que Pedro nunca tinha reparado antes. E ele percebeu, ouvindo cada palavra, que aquela também era uma forma de manter uma história acesa: não só encontrar a porta entreaberta no fim do corredor, mas abrir as portas que já estavam bem na frente dele o tempo todo.', N'["raposa", "biblioteca", "guardião", "lembrar", "civilização", "histórias"]', N'{"idOriginal": "n3", "fases": [{"texto": "Pedro tinha o hábito de não prestar atenção nas coisas. Não por descuido, exatamente — era mais uma questão de <strong class=\"palavra-chave\">escolha</strong>. O mundo tinha partes interessantes e partes que não valiam o espaço, e Pedro achava que sabia muito bem distinguir uma coisa da outra. A porta marrom no fundo do corredor da escola, por exemplo, claramente pertencia à segunda categoria. Era velha, sem plaquinha, sem maçaneta especial. Provavelmente um depósito de vassouras. Ele tinha passado por ela centenas de vezes sem pestanejar."}, {"texto": "Havia, é verdade, um episódio antigo que Pedro preferia não lembrar. Quando tinha seis anos, encontrara um caderno de desenhos debaixo da cama da avó — cheio de esboços de um jardim que ela dizia ter visitado quando criança, um jardim que, segundo os adultos, nunca tinha existido de verdade. Pedro perguntara, perguntara de novo, e a resposta era sempre a mesma: invenção de velha. Com o tempo, aprendeu a lição ao contrário do que deveria: coisas estranhas eram melhor ignoradas do que investigadas. Foi assim que Pedro se tornou, aos poucos, um menino que sabia olhar para o lado sem ver."}, {"texto": "Até aquela quinta-feira. Pedro voltava da aula de ciências com a cabeça ainda cheia de perguntas que o professor não soubera responder — ou não quisera. Ao passar pelo corredor, percebeu algo diferente: a porta estava <strong class=\"palavra-chave\">entreaberta</strong>. Uma fresta fina. E por ela vazava uma luz que não era de lâmpada. Era dourada demais. Quente demais. Pedro parou. Olhou para os dois lados do corredor. Não havia ninguém. Ele empurrou a porta devagar."}, {"texto": "O que havia do outro lado não cabia na lógica de um depósito de vassouras. Era uma <strong class=\"palavra-chave\">biblioteca enorme</strong> — alta demais para caber num prédio térreo, larga demais para estar dentro da escola. As prateleiras iam do chão ao teto e se curvavam levemente, como se o cômodo fosse redondo. E os livros brilhavam. Não todos — mas muitos tinham um leve pulsar de luz na lombada, como se respirassem. Pedro sentiu que deveria ter medo. Mas o que sentiu foi outra coisa: <strong class=\"palavra-chave\">reconhecimento</strong>. Como se aquele lugar já o esperasse há tempo. E, por um instante, pensou no caderno da avó, guardado havia anos numa caixa que ninguém mais abria."}, {"texto": "\"Você demorou.\" A voz veio de algum lugar entre as prateleiras. Pedro deu um passo atrás — mas não saiu. Uma <strong class=\"palavra-chave\">raposa</strong> surgiu caminhando devagar, óculos de aros dourados equilibrados na ponta do focinho, um livro aberto na pata esquerda. Ela se sentou numa cadeira de veludo vermelho como se aquilo fosse a coisa mais natural do mundo. \"Cada guardião demora um tempo diferente para encontrar a biblioteca\", ela disse. \"Alguns levam dias. Outros, anos. Você levou três.\" Pedro abriu a boca. \"Três o quê?\" \"Anos de escola\", respondeu a raposa, virando uma página."}, {"texto": "A raposa se apresentou como Nogueira, e explicou com a paciência de quem já explicou a mesma coisa muitas vezes — e ainda assim não achava a explicação cansativa. Cada livro naquela biblioteca guardava uma <strong class=\"palavra-chave\">história verdadeira</strong>: não necessariamente um fato histórico, mas algo que havia sido sentido de verdade por alguém, em algum lugar, em algum tempo. \"Histórias verdadeiras precisam ser lidas\", ela disse. \"Quando ninguém lê, elas enfraquecem. A lombada perde o brilho. E quando o brilho some de vez…\" Ela fechou o livro com cuidado. \"A história desaparece. Como se nunca tivesse acontecido.\""}, {"texto": "Pedro quis saber havia quanto tempo Nogueira era guardiã. \"Guardiões não contam a própria idade\", ela respondeu, com um meio sorriso que Pedro não soube decifrar. \"Mas posso dizer que já vi muitos meninos como você passarem por essa porta. A maioria some depois de uma visita. Acha que sonhou. Volta para a vida de sempre e nunca mais repara em portas entreabertas.\" Ela olhou para ele por cima dos óculos. \"Você não me parece desse tipo. Ou talvez seja. Isso, só o tempo mostra.\""}, {"texto": "Pedro passou aquela tarde inteira na biblioteca. Leu sobre uma <strong class=\"palavra-chave\">civilização</strong> que construía cidades nas copas das árvores e desapareceu antes de ser descoberta. Leu o diário de uma menina que vivia numa estação espacial e sentia saudade da chuva. Leu a história de um urso que tinha aprendido a escrever sozinho e deixado cartas escondidas em ocos de árvores pela floresta. Cada livro tinha um brilho diferente. Alguns pulsavam devagar, como coração em repouso. Outros tremiam um pouco, como se tivessem pressa de ser lidos."}, {"texto": "Numa prateleira mais baixa, quase escondida atrás de outras, Pedro encontrou um livro fino, com a lombada quase apagada — só um fiapo de luz, tremendo fraco, prestes a se apagar de vez. Puxou-o com cuidado. Na capa, sem título, havia apenas o desenho de um jardim. Um jardim que ele reconheceu na hora, com um aperto estranho no peito: era o mesmo jardim do caderno da avó. Abriu o livro e viu, entre as páginas, a letra torta de uma menina de sete anos escrevendo sobre canteiros de flores que ninguém mais acreditava terem existido. \"Essa história está quase apagando\", disse Nogueira, que tinha se aproximado sem fazer barulho. \"Ninguém lê há muito tempo. A senhora que viveu isso contou para poucas pessoas, e quase ninguém acreditou nela.\" Pedro sentiu o rosto esquentar. \"Ela é minha avó\", disse baixinho. \"Eu não acreditei.\""}, {"texto": "\"Agora você pode escolher acreditar\", respondeu a raposa. \"Um livro não desaparece só porque foi esquecido uma vez. Ele desaparece quando é esquecido para sempre.\" Pedro sentou-se ali mesmo, no chão entre as prateleiras, e leu a história inteira do jardim da avó — um lugar que existira de verdade, décadas atrás, atrás de uma casa que já não existia mais, cheio de flores que ninguém sabia mais nomear. Quando terminou, a lombada do livro já brilhava um pouco mais forte."}, {"texto": "Quando saiu, o corredor estava vazio e as luzes da escola já tinham sido apagadas. Pedro ficou parado diante da porta marrom, agora fechada de novo. Entendeu, naquele momento, o que a raposa quis dizer. Ser <strong class=\"palavra-chave\">guardião</strong> não era uma tarefa de vigia — não era trancar a biblioteca, catalogar os livros, protegê-los do pó. Era outra coisa, mais difícil e mais simples ao mesmo tempo: era carregar as histórias dentro de si. <strong class=\"palavra-chave\">Lembrar</strong> delas. Deixar que mudassem alguma coisa. Porque uma história só existe de verdade quando alguém a leva para fora da página."}, {"texto": "No dia seguinte, Pedro foi visitar a avó depois da escola, pela primeira vez em meses sem que a mãe precisasse pedir. Sentou-se ao lado dela e perguntou sobre o jardim. A avó pareceu surpresa — ninguém perguntava havia tanto tempo. Começou a contar, devagar no início, depois com mais vontade, os olhos brilhando de um jeito que Pedro nunca tinha reparado antes. E ele percebeu, ouvindo cada palavra, que aquela também era uma forma de manter uma história acesa: não só encontrar a porta entreaberta no fim do corredor, mas abrir as portas que já estavam bem na frente dele o tempo todo."}]}');
GO

INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson)
VALUES ('manual', N'A Chuva Cantando', N'Poético', 1, N'3 min', N'🌧️', N'🌧️🌈☂️', N'<em>"Pingo, pingo, pinguinho,<br>a <strong class="palavra-chave">chuva</strong> veio sim!<br>Molhou o <strong class="palavra-chave">passarinho</strong>,<br>molhou o meu <strong class="palavra-chave">jardim</strong>."</em> <em>"Pingo, pingo, pinguinho,<br>que gostoso é assim!<br>Bate na janelinha,<br>tim, tim, tim, tim!"</em>', N'["pingo", "chuva", "passarinho", "jardim"]', N'{"idOriginal": "p1", "fases": [{"texto": "<em>\"<strong class=\"palavra-chave\">Pingo</strong>, pingo, pinguinho,<br>a <strong class=\"palavra-chave\">chuva</strong> veio sim!<br>Molhou o <strong class=\"palavra-chave\">passarinho</strong>,<br>molhou o meu <strong class=\"palavra-chave\">jardim</strong>.\"</em>"}, {"texto": "<em>\"Pingo, pingo, pinguinho,<br>que gostoso é assim!<br>Bate na janelinha,<br>tim, tim, tim, tim!\"</em>"}]}');
GO

INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson)
VALUES ('manual', N'Palavras que Voam', N'Poético', 2, N'5 min', N'🦋', N'🦋🌸📜', N'<em>"<strong class="palavra-chave">Palavras</strong> são <strong class="palavra-chave">pássaros</strong><br> que moram no <strong class="palavra-chave">papel</strong>,<br> guardam <strong class="palavra-chave">segredos</strong> doces<br> mais doces que o mel."<br></em> <em>"Quando você as lê,<br> elas ganham <strong class="palavra-chave">asas</strong>,<br> atravessam a noite<br> e chegam nas casas."<br></em> <em>"Há palavras mansas<br> que chegam de mansinho,<br> como luz de vela<br> no fim do caminho."<br></em> <em>"Guarda bem as tuas,<br>escolhe com cuidado —<br>uma palavra dita<br> não volta ao seu lado."<br></em>', N'["palavras", "pássaros", "papel", "asas", "segredos"]', N'{"idOriginal": "p2", "fases": [{"texto": "<em>\"<strong class=\"palavra-chave\">Palavras</strong> são <strong class=\"palavra-chave\">pássaros</strong><br> que moram no <strong class=\"palavra-chave\">papel</strong>,<br> guardam <strong class=\"palavra-chave\">segredos</strong> doces<br> mais doces que o mel.\"<br></em>"}, {"texto": "<em> \"Quando você as lê,<br> elas ganham <strong class=\"palavra-chave\">asas</strong>,<br> atravessam a noite<br> e chegam nas casas.\"<br></em>"}, {"texto": "<em>\"Há palavras mansas<br> que chegam de mansinho,<br> como luz de vela<br> no fim do caminho.\"<br></em>"}, {"texto": "<em>\"Guarda bem as tuas,<br>escolhe com cuidado —<br>uma palavra dita<br> não volta ao seu lado.\"<br></em>"}]}');
GO

INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson)
VALUES ('manual', N'Como Fazer uma Casinha para Pássaros', N'Cotidiano', 1, N'2 min', N'🏡', N'🐦🏠🔨', N'Pegue uma <strong class="palavra-chave">caixa</strong>, tinta e <strong class="palavra-chave">palitos</strong>.<br>Pinte a caixa.<br>Cole os palitos.<br>Faça um <strong class="palavra-chave">buraco</strong>.<br>Pronto! Casinha para os <strong class="palavra-chave">pássaros</strong>!', N'["caixa", "tinta", "palitos", "buraco", "pássaros"]', N'{"idOriginal": "i1", "fases": [{"texto": "Pegue uma <strong class=\"palavra-chave\">caixa</strong>, tinta e <strong class=\"palavra-chave\">palitos</strong>."}, {"texto": "Pinte a caixa. Cole os palitos. Faça um <strong class=\"palavra-chave\">buraco</strong>."}, {"texto": "Pronto! Casinha para os <strong class=\"palavra-chave\">pássaros</strong>!"}]}');
GO

INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson)
VALUES ('manual', N'Receita: Cápsula do Tempo', N'Cotidiano', 3, N'6 min', N'🟢', N'🧪🟢✋', N'Uma <strong class="palavra-chave">cápsula do tempo</strong> é uma caixa fechada com cuidado, guardada para ser aberta só depois de muitos anos — quando quem a fechou já não for bem a mesma pessoa.<br><br>Bia, de dez anos, decidiu fazer a sua com o irmão Théo, de sete. Os dois se sentaram na varanda com uma caixa de metal vazia.<br><br><strong class="palavra-chave">Materiais</strong>: uma caixa resistente e à prova d''água, papel, caneta, fotos, alguns objetos pequenos e uma etiqueta com a data de hoje e a data de abertura.<br><br>Primeiro, cada um escreveu uma carta contando como é hoje e o que espera do futuro. Théo ditou a sua, porque ainda escrevia devagar: "Hoje eu tive medo da piscina funda, mas entrei mesmo assim."<br><br>Depois, escolheram objetos especiais: Bia guardou uma pena de passarinho; Théo, um dente de leite que tinha acabado de cair.<br><br>Fecharam tudo com cuidado, escreveram a data na etiqueta e enterraram a caixa perto da árvore do avô, marcando o lugar com uma pedra amarela.<br><br>Cinco anos depois, Théo desenterrou a caixa e encontrou a carta, a pena e o dente — <strong class="palavra-chave">pedacinhos de quem ele já tinha sido</strong>.', N'["cápsula do tempo", "lembrança", "pertencimento", "simbólico", "identidade"]', N'{"idOriginal": "i2", "fases": [{"texto": "Uma <strong class=\"palavra-chave\">cápsula do tempo</strong> é uma caixa fechada com cuidado, guardada para ser aberta só depois de muitos anos — quando quem a fechou já não for bem a mesma pessoa."}, {"texto": "Bia, de dez anos, decidiu fazer a sua com o irmão Théo, de sete. Os dois se sentaram na varanda com uma caixa de metal vazia."}, {"texto": "<strong class=\"palavra-chave\">Materiais</strong>: uma caixa resistente e à prova d''água, papel, caneta, fotos, alguns objetos pequenos e uma etiqueta com a data de hoje e a data de abertura."}, {"texto": "Primeiro, cada um escreveu uma carta contando como é hoje e o que espera do futuro. Théo ditou a sua, porque ainda escrevia devagar: \"Hoje eu tive medo da piscina funda, mas entrei mesmo assim.\""}, {"texto": "Depois, escolheram objetos especiais: Bia guardou uma pena de passarinho; Théo, um dente de leite que tinha acabado de cair."}, {"texto": "Fecharam tudo com cuidado, escreveram a data na etiqueta e enterraram a caixa perto da árvore do avô, marcando o lugar com uma pedra amarela."}, {"texto": "Cinco anos depois, Théo desenterrou a caixa e encontrou a carta, a pena e o dente — <strong class=\"palavra-chave\">pedacinhos de quem ele já tinha sido</strong>."}]}');
GO

INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson)
VALUES ('manual', N'O Fundo do Mar Encantado', N'Descritivo', 2, N'6 min', N'🌊', N'🐠🌊🐙', N'O fundo do mar é um mundo à parte — um lugar que poucos olhos já viram de verdade, mas que existe cheio de vida bem abaixo das ondas. A primeira coisa que chama atenção é a <strong class="palavra-chave">luz</strong>: ela chega filtrada pela água, formando raios dourados que iluminam tudo como lanternas balançando no teto. Logo se vê o conjunto de <strong class="palavra-chave">cores vibrantes</strong> que cobre o fundo. Corais <strong class="palavra-chave">laranja e rosa</strong> crescem em formas curiosas — alguns parecem árvores, outros parecem leques abertos. Juntos, formam verdadeiras florestas subaquáticas, com suas próprias ruas e esconderijos. Entre os corais, peixes de todas as formas dançam sem parar. Alguns são listrados de preto e branco, outros têm manchas amarelas e azuis. As algas verdes balançam suavemente na corrente, como se ouvissem uma música que só elas conhecem. No chão do oceano, estrelas-do-mar de cor <strong class="palavra-chave">avermelhada</strong> caminham devagar sobre a areia branca. Polvos curiosos esticam seus <strong class="palavra-chave">tentáculos</strong> para explorar conchas e frestas escuras. O fundo do mar não tem som da forma que conhecemos — mas não é silencioso. Há o rangido suave dos corais, o farfalhar das algas, o movimento constante da água. Quem mergulha fundo o suficiente entende: o mar não está vazio. Ele só guarda seus segredos com muito cuidado.', N'["cores", "corais", "vibrantes", "avermelhada", "tentáculos"]', N'{"idOriginal": "d1", "fases": [{"texto": "O fundo do mar é um mundo à parte — um lugar que poucos olhos já viram de verdade, mas que existe cheio de vida bem abaixo das ondas. A primeira coisa que chama atenção é a <strong class=\"palavra-chave\">luz</strong>: ela chega filtrada pela água, formando raios dourados que iluminam tudo como lanternas balançando no teto."}, {"texto": "Logo se vê o conjunto de <strong class=\"palavra-chave\">cores vibrantes</strong> que cobre o fundo. Corais <strong class=\"palavra-chave\">laranja e rosa</strong> crescem em formas curiosas — alguns parecem árvores, outros parecem leques abertos. Juntos, formam verdadeiras florestas subaquáticas, com suas próprias ruas e esconderijos."}, {"texto": "Entre os corais, peixes de todas as formas dançam sem parar. Alguns são listrados de preto e branco, outros têm manchas amarelas e azuis. As algas verdes balançam suavemente na corrente, como se ouvissem uma música que só elas conhecem."}, {"texto": "No chão do oceano, estrelas-do-mar de cor <strong class=\"palavra-chave\">avermelhada</strong> caminham devagar sobre a areia branca. Polvos curiosos esticam seus <strong class=\"palavra-chave\">tentáculos</strong> para explorar conchas e frestas escuras."}, {"texto": "O fundo do mar não tem som da forma que conhecemos — mas não é silencioso. Há o rangido suave dos corais, o farfalhar das algas, o movimento constante da água. Quem mergulha fundo o suficiente entende: o mar não está vazio. Ele só guarda seus segredos com muito cuidado."}]}');
GO

INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson)
VALUES ('manual', N'O Jardim da Vovó', N'Descritivo', 1, N'4 min', N'🌻', N'🌻🌹🦋', N'O jardim da <strong class="palavra-chave">vovó</strong> é cheio de flores! Tem rosas <strong class="palavra-chave">vermelhas</strong>, margaridas brancas e girassóis amarelos. As cores são lindas e o cheiro é muito <strong class="palavra-chave">gostoso</strong>. As borboletas adoram esse jardim e pousam nas flores, quietinhas. Os passarinhos cantam alto e alegram o jardim todo. No meio tem um <strong class="palavra-chave">banco</strong> de madeira velho. A vovó senta ali toda tarde, toma chá e fica olhando as flores. É o lugar mais <strong class="palavra-chave">tranquilo</strong> do mundo!', N'["vovó", "vermelhas", "gostoso", "banco", "tranquilo"]', N'{"idOriginal": "d2", "fases": [{"texto": "O jardim da <strong class=\"palavra-chave\">vovó</strong> é cheio de flores! Tem rosas <strong class=\"palavra-chave\">vermelhas</strong>, margaridas brancas e girassóis amarelos. As cores são lindas e o cheiro é muito <strong class=\"palavra-chave\">gostoso</strong>."}, {"texto": "As borboletas adoram esse jardim e pousam nas flores, quietinhas. Os passarinhos cantam alto e alegram o jardim todo."}, {"texto": "No meio tem um <strong class=\"palavra-chave\">banco</strong> de madeira velho. A vovó senta ali toda tarde, toma chá e fica olhando as flores. É o lugar mais <strong class=\"palavra-chave\">tranquilo</strong> do mundo!"}]}');
GO

INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson)
VALUES ('manual', N'Por Que o Céu é Azul?', N'Informativo', 2, N'6 min', N'🔵', N'☀️🔵🌍', N'A luz do <strong class="palavra-chave">Sol</strong> parece branca, mas na verdade é formada por todas as cores do arco-íris, misturadas em um só brilho. Quando essa luz sai do Sol, ela viaja milhões de quilômetros até a Terra e atravessa a <strong class="palavra-chave">atmosfera</strong>, uma camada de ar que envolve o planeta como um cobertor invisível, cheia de partículas pequenas demais para serem vistas. Cada cor da <strong class="palavra-chave">luz</strong> reage de um jeito diferente ao passar por essas partículas. A luz vermelha e a amarela têm ondas mais longas e atravessam o ar quase sem serem incomodadas. Já a cor <strong class="palavra-chave">azul</strong> tem uma onda curtinha e saltitante, que se espalha para todos os lados quando encontra as partículas — esse fenômeno se chama espalhamento de luz. Como o azul se espalha muito mais, ele acaba preenchendo todo o céu. Por isso, durante o dia, o céu sempre aparece pintado de azul. Ao entardecer, o Sol fica baixo e sua luz precisa atravessar uma camada maior de atmosfera. Quase toda a luz azul já se espalhou pelo caminho, e sobram o laranja e o vermelho — por isso o pôr do sol tem essas cores. À noite, o Sol fica escondido do outro lado da Terra. Sem luz atravessando a atmosfera, não há mais nada para ser espalhado, e o céu fica escuro, deixando à mostra as <strong class="palavra-chave">estrelas</strong> e a Lua.', N'["Sol", "atmosfera", "luz", "azul", "estrelas"]', N'{"idOriginal": "inf1", "fases": [{"texto": "A luz do <strong class=\"palavra-chave\">Sol</strong> parece branca, mas na verdade é formada por todas as cores do arco-íris, misturadas em um só brilho. Quando essa luz sai do Sol, ela viaja milhões de quilômetros até a Terra e atravessa a <strong class=\"palavra-chave\">atmosfera</strong>, uma camada de ar que envolve o planeta como um cobertor invisível, cheia de partículas pequenas demais para serem vistas."}, {"texto": "Cada cor da <strong class=\"palavra-chave\">luz</strong> reage de um jeito diferente ao passar por essas partículas. A luz vermelha e a amarela têm ondas mais longas e atravessam o ar quase sem serem incomodadas. Já a cor <strong class=\"palavra-chave\">azul</strong> tem uma onda curtinha e saltitante, que se espalha para todos os lados quando encontra as partículas — esse fenômeno se chama espalhamento de luz. Como o azul se espalha muito mais, ele acaba preenchendo todo o céu. Por isso, durante o dia, o céu sempre aparece pintado de azul."}, {"texto": "Ao entardecer, o Sol fica baixo e sua luz precisa atravessar uma camada maior de atmosfera. Quase toda a luz azul já se espalhou pelo caminho, e sobram o laranja e o vermelho — por isso o pôr do sol tem essas cores."}, {"texto": "À noite, o Sol fica escondido do outro lado da Terra. Sem luz atravessando a atmosfera, não há mais nada para ser espalhado, e o céu fica escuro, deixando à mostra as <strong class=\"palavra-chave\">estrelas</strong> e a Lua."}]}');
GO

INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson)
VALUES (
'manual',
N'Amazônia: O Pulmão do Mundo',
N'Informativo',
3,
N'10 min',
N'🌿',
N'🌳🦜🌊',

N'Existem lugares no mundo que não podem ser medidos apenas em números, ainda que os números, no caso da <strong class="palavra-chave">Floresta Amazônica</strong>, já sejam de tirar o fôlego: 5,5 milhões de quilômetros quadrados espalhados por nove países, um território tão vasto que caberia dentro dele quase toda a Europa Ocidental. Mas reduzir a Amazônia a uma soma de hectares é como descrever o oceano apenas pela sua profundidade — verdadeiro, porém insuficiente. A floresta é, antes de tudo, um <strong class="palavra-chave">organismo vivo e interdependente</strong>, uma teia silenciosa em que cada fio sustenta os demais. Estima-se que ali habite mais de 10% de todas as espécies conhecidas do planeta, um <strong class="palavra-chave">arquivo genético</strong> insubstituível que a ciência ainda mal começou a decifrar. Cada árvore derrubada é, portanto, uma página arrancada de uma biblioteca que a humanidade nunca terminou de ler.<br><br>

Chamamos a Amazônia de "pulmão do mundo", mas essa metáfora — tão repetida que quase perdeu a força — esconde um mecanismo de rara elegância. Por meio do <strong class="palavra-chave">processo</strong> da fotossíntese, bilhões de folhas absorvem <strong class="palavra-chave">dióxido de carbono</strong> e devolvem à atmosfera o <strong class="palavra-chave">oxigênio</strong> que sustenta a vida muito além de suas fronteiras. É um pacto invisível entre a floresta e o restante do planeta: ela respira por todos nós, e por isso o que acontece em seu interior jamais permanece confinado ali. As chuvas que caem no Sudeste brasileiro, os chamados "rios voadores" de umidade que cruzam o continente, nascem, em boa parte, do hálito da própria mata. Destruir a Amazônia não é apenas perder uma paisagem: é romper um <strong class="palavra-chave">equilíbrio</strong> que sustenta economias, lavouras e cidades a milhares de quilômetros de distância.<br><br>

Mas a floresta não é apenas biologia — é também memória e pertencimento. Comunidades indígenas e ribeirinhas habitam esse território há milênios, e para elas a mata não é recurso a ser explorado, mas casa, ancestralidade, identidade. Quando a <strong class="palavra-chave">devastação</strong> avança, o que se perde não são só árvores: são modos de vida inteiros, línguas, saberes transmitidos de geração em geração. Há, nesse sentido, uma questão de <strong class="palavra-chave">justiça</strong> por trás de cada estatística ambiental — a pergunta sobre quem paga o preço de um progresso que beneficia poucos e ameaça muitos. A perda da floresta é, também, a perda de um lugar no mundo para quem sempre viveu em harmonia com ela.<br><br>

Preservar a Amazônia, portanto, não é gesto de caridade distante, mas ato de <strong class="palavra-chave">cuidado</strong>. Cada escolha de consumo, cada apoio a projetos de reflorestamento, cada exigência por políticas mais rígidas contra a devastação ilegal é um fio a mais tecido de volta nessa teia. A floresta resiste, mas sua resiliência tem limites — e talvez o verdadeiro teste de nossa geração seja decidir se seremos lembrados como quem salvou esse pulmão, ou como quem o deixou, aos poucos, sufocar.',

N'["organismo", "processo", "equilíbrio", "devastação", "cuidado"]',

N'{"idOriginal": "inf2", "fases": [
{"texto": "Existem lugares no mundo que não podem ser medidos apenas em números, ainda que os números, no caso da <strong class=\"palavra-chave\">Floresta Amazônica</strong>, já sejam de tirar o fôlego: 5,5 milhões de quilômetros quadrados espalhados por nove países, um território tão vasto que caberia dentro dele quase toda a Europa Ocidental. Mas reduzir a Amazônia a uma soma de hectares é como descrever o oceano apenas pela sua profundidade — verdadeiro, porém insuficiente. A floresta é, antes de tudo, um <strong class=\"palavra-chave\">organismo vivo e interdependente</strong>, uma teia silenciosa em que cada fio sustenta os demais. Estima-se que ali habite mais de 10% de todas as espécies conhecidas do planeta, um <strong class=\"palavra-chave\">arquivo genético</strong> insubstituível que a ciência ainda mal começou a decifrar. Cada árvore derrubada é, portanto, uma página arrancada de uma biblioteca que a humanidade nunca terminou de ler."},

{"texto": "Chamamos a Amazônia de \"pulmão do mundo\", mas essa metáfora — tão repetida que quase perdeu a força — esconde um mecanismo de rara elegância. Por meio do <strong class=\"palavra-chave\">processo</strong> da fotossíntese, bilhões de folhas absorvem <strong class=\"palavra-chave\">dióxido de carbono</strong> e devolvem à atmosfera o <strong class=\"palavra-chave\">oxigênio</strong> que sustenta a vida muito além de suas fronteiras. É um pacto invisível entre a floresta e o restante do planeta: ela respira por todos nós, e por isso o que acontece em seu interior jamais permanece confinado ali. As chuvas que caem no Sudeste brasileiro, os chamados \"rios voadores\" de umidade que cruzam o continente, nascem, em boa parte, do hálito da própria mata. Destruir a Amazônia não é apenas perder uma paisagem: é romper um <strong class=\"palavra-chave\">equilíbrio</strong> que sustenta economias, lavouras e cidades a milhares de quilômetros de distância."},

{"texto": "Mas a floresta não é apenas biologia — é também memória e pertencimento. Comunidades indígenas e ribeirinhas habitam esse território há milênios, e para elas a mata não é recurso a ser explorado, mas casa, ancestralidade, identidade. Quando a <strong class=\"palavra-chave\">devastação</strong> avança, o que se perde não são só árvores: são modos de vida inteiros, línguas, saberes transmitidos de geração em geração. Há, nesse sentido, uma questão de <strong class=\"palavra-chave\">justiça</strong> por trás de cada estatística ambiental — a pergunta sobre quem paga o preço de um progresso que beneficia poucos e ameaça muitos. A perda da floresta é, também, a perda de um lugar no mundo para quem sempre viveu em harmonia com ela."},

{"texto": "Preservar a Amazônia, portanto, não é gesto de caridade distante, mas ato de <strong class=\"palavra-chave\">cuidado</strong>. Cada escolha de consumo, cada apoio a projetos de reflorestamento, cada exigência por políticas mais rígidas contra a devastação ilegal é um fio a mais tecido de volta nessa teia. A floresta resiste, mas sua resiliência tem limites — e talvez o verdadeiro teste de nossa geração seja decidir se seremos lembrados como quem salvou esse pulmão, ou como quem o deixou, aos poucos, sufocar."}
]}');

GO

-- Backfill de FK de gênero (Cotidiano → instrucional; Poético → poetico via CI_AI)
UPDATE h
SET h.Id_Genero = g.Id
FROM Historia AS h
INNER JOIN Genero AS g
    ON g.Slug = CASE
        WHEN h.Genero COLLATE Latin1_General_CI_AI = N'cotidiano' THEN N'instrucional'
        WHEN h.Genero COLLATE Latin1_General_CI_AI = N'narrativo' THEN N'narrativo'
        WHEN h.Genero COLLATE Latin1_General_CI_AI = N'poetico' THEN N'poetico'
        WHEN h.Genero COLLATE Latin1_General_CI_AI = N'instrucional' THEN N'instrucional'
        WHEN h.Genero COLLATE Latin1_General_CI_AI = N'descritivo' THEN N'descritivo'
        WHEN h.Genero COLLATE Latin1_General_CI_AI = N'informativo' THEN N'informativo'
        ELSE NULL
    END
WHERE h.Id_Genero IS NULL;
GO