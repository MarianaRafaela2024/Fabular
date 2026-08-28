-- Etapa 11 DOWN: remove a tabela nova. PalavrasChaveJson permanece.

SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Historia_PalavraChave', N'U') IS NOT NULL
    DROP TABLE dbo.Historia_PalavraChave;
GO
