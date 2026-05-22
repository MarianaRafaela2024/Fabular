SET NOCOUNT ON;

USE Fabular;
GO

IF OBJECT_ID('Evento_Minigame') IS NOT NULL DROP TABLE Evento_Minigame;
IF OBJECT_ID('Sessao_Leitura') IS NOT NULL DROP TABLE Sessao_Leitura;
IF OBJECT_ID('IA_Geracao') IS NOT NULL DROP TABLE IA_Geracao;
IF OBJECT_ID('Historia_Minigame') IS NOT NULL DROP TABLE Historia_Minigame;
IF OBJECT_ID('Sincronizacao_Progresso') IS NOT NULL DROP TABLE Sincronizacao_Progresso;
IF OBJECT_ID('Responsavel_Crianca') IS NOT NULL DROP TABLE Responsavel_Crianca;
IF OBJECT_ID('Historia') IS NOT NULL DROP TABLE Historia;
IF OBJECT_ID('Crianca') IS NOT NULL DROP TABLE Crianca;
IF OBJECT_ID('Responsavel') IS NOT NULL DROP TABLE Responsavel;
IF OBJECT_ID('Genero') IS NOT NULL DROP TABLE Genero;

CREATE TABLE Genero (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Responsavel (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(80) NOT NULL,
    Sobrenome NVARCHAR(80) NULL,
    Email VARCHAR(160) NOT NULL UNIQUE,
    SenhaHash VARCHAR(255) NOT NULL,
    CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Crianca (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(80) NOT NULL,
    FaixaEtaria TINYINT NOT NULL CHECK (FaixaEtaria IN (1,2,3)),
    Avatar VARCHAR(32) NULL,
    GeneroFavorito VARCHAR(32) NULL,
    Estrela SMALLINT NOT NULL DEFAULT 0,
    LocalChildKey VARCHAR(80) NULL,
    CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
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
    CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
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

CREATE INDEX IX_Responsavel_Email ON Responsavel(Email);
CREATE INDEX IX_Crianca_LocalKey ON Crianca(LocalChildKey);
CREATE INDEX IX_Historia_FaixaGenero ON Historia(FaixaEtaria, Genero);
CREATE INDEX IX_SL_Crianca ON Sessao_Leitura(Id_Crianca, CriadoEm DESC);
CREATE INDEX IX_SP_ResponsavelCrianca ON Sincronizacao_Progresso(Id_Responsavel, Id_Crianca, UpdatedAt DESC);

INSERT INTO Genero (Nome) VALUES ('Narrativo'), ('Poetico'), ('Instrucional'), ('Descritivo'), ('Informativo');