-- Teste mínimo da etapa 8: backup, unique filtrado e contagens = 1.

SET NOCOUNT ON;
USE Fabular;
GO

DECLARE @faltando NVARCHAR(400) = N'';

IF OBJECT_ID(N'dbo.Atividade_Diaria_Backup_008', N'U') IS NULL
    SET @faltando = @faltando + N'Atividade_Diaria_Backup_008; ';
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UQ_AD_CriancaData_SemHistoria' AND object_id = OBJECT_ID(N'dbo.Atividade_Diaria')
)
    SET @faltando = @faltando + N'UQ_AD_CriancaData_SemHistoria; ';

IF @faltando <> N''
BEGIN
    RAISERROR(N'Etapa 8 VERIFY falhou. Ausentes: %s', 16, 1, @faltando);
END
ELSE IF EXISTS (SELECT 1 FROM dbo.Atividade_Diaria WHERE HistoriasConcluidas <> 1)
BEGIN
    RAISERROR(N'Etapa 8 VERIFY falhou: ainda há HistoriasConcluidas diferente de 1.', 16, 1);
END
ELSE
    PRINT 'Etapa 8 VERIFY ok: backup + unique filtrado; HistoriasConcluidas canônico.';
GO
