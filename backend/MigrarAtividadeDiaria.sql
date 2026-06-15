-- Migração: calendário de atividade diária
IF OBJECT_ID('Atividade_Diaria', 'U') IS NULL
BEGIN
    CREATE TABLE Atividade_Diaria (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Id_Crianca INT NOT NULL,
        Data DATE NOT NULL,
        HistoriasConcluidas INT NOT NULL DEFAULT 0,
        CONSTRAINT FK_AD_Crianca FOREIGN KEY (Id_Crianca) REFERENCES Crianca(Id) ON DELETE CASCADE,
        CONSTRAINT UQ_AD_CriancaData UNIQUE (Id_Crianca, Data)
    );

    CREATE INDEX IX_AD_CriancaData ON Atividade_Diaria(Id_Crianca, Data DESC);
END
