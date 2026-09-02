-- Teste mínimo da etapa 4: os três índices aditivos existem.

SET NOCOUNT ON;
USE Fabular;
GO

DECLARE @faltando NVARCHAR(400) = N'';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_IAG_Historia' AND object_id = OBJECT_ID(N'dbo.IA_Geracao'))
    SET @faltando = @faltando + N'IX_IAG_Historia; ';
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_IAG_Crianca' AND object_id = OBJECT_ID(N'dbo.IA_Geracao'))
    SET @faltando = @faltando + N'IX_IAG_Crianca; ';
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_EM_Sessao' AND object_id = OBJECT_ID(N'dbo.Evento_Minigame'))
    SET @faltando = @faltando + N'IX_EM_Sessao; ';

IF @faltando <> N''
BEGIN
    RAISERROR(N'Etapa 4 VERIFY falhou. Índices ausentes: %s', 16, 1, @faltando);
    RETURN;
END

PRINT 'Etapa 4 VERIFY ok: IX_IAG_Historia, IX_IAG_Crianca, IX_EM_Sessao presentes.';
GO
