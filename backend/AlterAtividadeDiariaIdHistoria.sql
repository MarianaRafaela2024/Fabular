-- Migração: adiciona Id_Historia e chave estrangeira à tabela Atividade_Diaria
USE Fabular;
GO

IF COL_LENGTH('Atividade_Diaria', 'Id_Historia') IS NULL
BEGIN
    IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_AD_CriancaData')
    BEGIN
        ALTER TABLE Atividade_Diaria DROP CONSTRAINT UQ_AD_CriancaData;
    END

    ALTER TABLE Atividade_Diaria ADD Id_Historia INT NULL;

    ALTER TABLE Atividade_Diaria ADD CONSTRAINT FK_AD_Historia FOREIGN KEY (Id_Historia) REFERENCES Historia(Id) ON DELETE CASCADE;
END
GO
