-- Migração: adiciona HistoriasConcluidasJson à tabela Relatorio_Crianca (banco já existente)
USE Fabular;
GO

IF COL_LENGTH('Relatorio_Crianca', 'HistoriasConcluidasJson') IS NULL
BEGIN
    ALTER TABLE Relatorio_Crianca ADD HistoriasConcluidasJson NVARCHAR(MAX) NULL;
END
GO
