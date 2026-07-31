-- Migração: adiciona data de nascimento à tabela Crianca (banco já existente)
USE Fabular;
GO

IF COL_LENGTH('Crianca', 'DataNascimento') IS NULL
BEGIN
    ALTER TABLE Crianca ADD DataNascimento DATE NULL;
END
GO
