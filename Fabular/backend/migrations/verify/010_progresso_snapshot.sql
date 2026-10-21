-- Teste mínimo da etapa 10: tabela snapshot e PK composta.

SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Progresso_Snapshot', N'U') IS NULL
BEGIN
    RAISERROR(N'Etapa 10 VERIFY falhou: Progresso_Snapshot ausente.', 16, 1);
END
ELSE IF NOT EXISTS (
    SELECT 1 FROM sys.key_constraints
    WHERE name = N'PK_Progresso_Snapshot' AND parent_object_id = OBJECT_ID(N'dbo.Progresso_Snapshot')
)
BEGIN
    RAISERROR(N'Etapa 10 VERIFY falhou: PK_Progresso_Snapshot ausente.', 16, 1);
END
ELSE
    PRINT 'Etapa 10 VERIFY ok: Progresso_Snapshot presente.';
GO
