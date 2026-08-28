-- Etapa 1: congela no SQL o schema que a API já aplicava em runtime (ALTER TABLE).
-- Idempotente. Seguro em bancos novos (CriarBanco.sql) e em bancos antigos.

SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Crianca', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH(N'dbo.Crianca', N'DataNascimento') IS NULL
        ALTER TABLE dbo.Crianca ADD DataNascimento DATE NULL;

    IF COL_LENGTH(N'dbo.Crianca', N'HorarioBrincar') IS NULL
        ALTER TABLE dbo.Crianca ADD HorarioBrincar VARCHAR(10) NULL;
END
GO

IF OBJECT_ID(N'dbo.Relatorio_Crianca', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH(N'dbo.Relatorio_Crianca', N'HistoriasConcluidasJson') IS NULL
        ALTER TABLE dbo.Relatorio_Crianca ADD HistoriasConcluidasJson NVARCHAR(MAX) NULL;
END
GO

IF OBJECT_ID(N'dbo.Atividade_Diaria', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH(N'dbo.Atividade_Diaria', N'Id_Historia') IS NULL
        ALTER TABLE dbo.Atividade_Diaria ADD Id_Historia INT NULL;
END
GO
