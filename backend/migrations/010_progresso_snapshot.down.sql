-- Etapa 10 DOWN: remove só o snapshot. O log Sincronizacao_Progresso não é tocado.

SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Progresso_Snapshot', N'U') IS NOT NULL
    DROP TABLE dbo.Progresso_Snapshot;
GO
