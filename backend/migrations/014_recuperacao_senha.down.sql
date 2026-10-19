SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Recuperacao_Senha', N'U') IS NOT NULL
    DROP TABLE dbo.Recuperacao_Senha;
GO
