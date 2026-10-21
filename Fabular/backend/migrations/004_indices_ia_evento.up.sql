-- Etapa 4: índices aditivos (não alteram unicidade; não quebram INSERT).
-- Idempotente.

SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.IA_Geracao', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_IAG_Historia' AND object_id = OBJECT_ID(N'dbo.IA_Geracao'))
    CREATE INDEX IX_IAG_Historia ON dbo.IA_Geracao (Id_Historia);
GO

IF OBJECT_ID(N'dbo.IA_Geracao', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_IAG_Crianca' AND object_id = OBJECT_ID(N'dbo.IA_Geracao'))
    CREATE INDEX IX_IAG_Crianca ON dbo.IA_Geracao (Id_Crianca, CriadoEm DESC);
GO

IF OBJECT_ID(N'dbo.Evento_Minigame', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_EM_Sessao' AND object_id = OBJECT_ID(N'dbo.Evento_Minigame'))
    CREATE INDEX IX_EM_Sessao ON dbo.Evento_Minigame (Id_SessaoLeitura);
GO
