-- Etapa 4 DOWN: remove apenas os índices criados no UP.

SET NOCOUNT ON;
USE Fabular;
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_IAG_Historia' AND object_id = OBJECT_ID(N'dbo.IA_Geracao'))
    DROP INDEX IX_IAG_Historia ON dbo.IA_Geracao;
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_IAG_Crianca' AND object_id = OBJECT_ID(N'dbo.IA_Geracao'))
    DROP INDEX IX_IAG_Crianca ON dbo.IA_Geracao;
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_EM_Sessao' AND object_id = OBJECT_ID(N'dbo.Evento_Minigame'))
    DROP INDEX IX_EM_Sessao ON dbo.Evento_Minigame;
GO
