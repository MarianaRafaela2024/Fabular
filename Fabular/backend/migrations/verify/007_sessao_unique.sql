-- Teste mínimo da etapa 7: unique presente e sem duplicatas.

SET NOCOUNT ON;
USE Fabular;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UQ_SL_CriancaHistoria' AND object_id = OBJECT_ID(N'dbo.Sessao_Leitura')
)
BEGIN
    RAISERROR(N'Etapa 7 VERIFY falhou: UQ_SL_CriancaHistoria ausente.', 16, 1);
END
ELSE IF EXISTS (
    SELECT 1
    FROM dbo.Sessao_Leitura
    GROUP BY Id_Crianca, Id_Historia
    HAVING COUNT(*) > 1
)
BEGIN
    RAISERROR(N'Etapa 7 VERIFY falhou: ainda há duplicatas em Sessao_Leitura.', 16, 1);
END
ELSE
    PRINT 'Etapa 7 VERIFY ok: UQ_SL_CriancaHistoria presente, sem duplicatas.';
GO
