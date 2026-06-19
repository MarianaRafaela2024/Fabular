-- Migração incremental: adiciona tabela de relatório por criança em bancos existentes.
USE Fabular;
GO

IF OBJECT_ID('Relatorio_Crianca') IS NULL
BEGIN
    CREATE TABLE Relatorio_Crianca (
        Id_Crianca INT NOT NULL PRIMARY KEY,
        TentativasReprovadas INT NOT NULL DEFAULT 0,
        AcertosMG INT NOT NULL DEFAULT 0,
        ErrosMG INT NOT NULL DEFAULT 0,
        NaoConsigoOuvir INT NOT NULL DEFAULT 0,
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_RelCrianca_Crianca FOREIGN KEY (Id_Crianca) REFERENCES Crianca(Id) ON DELETE CASCADE
    );
END
GO
