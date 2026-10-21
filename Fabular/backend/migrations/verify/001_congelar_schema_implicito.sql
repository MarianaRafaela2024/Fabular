-- Teste mínimo da etapa 1: as quatro colunas oficiais existem.
-- Exit code != 0 se alguma faltar (sqlcmd -b).

SET NOCOUNT ON;
USE Fabular;
GO

DECLARE @faltando NVARCHAR(400) = N'';

IF COL_LENGTH(N'dbo.Crianca', N'DataNascimento') IS NULL
    SET @faltando = @faltando + N'Crianca.DataNascimento; ';
IF COL_LENGTH(N'dbo.Crianca', N'HorarioBrincar') IS NULL
    SET @faltando = @faltando + N'Crianca.HorarioBrincar; ';
IF COL_LENGTH(N'dbo.Relatorio_Crianca', N'HistoriasConcluidasJson') IS NULL
    SET @faltando = @faltando + N'Relatorio_Crianca.HistoriasConcluidasJson; ';
IF OBJECT_ID(N'dbo.Atividade_Diaria', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Atividade_Diaria', N'Id_Historia') IS NULL
    SET @faltando = @faltando + N'Atividade_Diaria.Id_Historia; ';

IF @faltando <> N''
BEGIN
    RAISERROR(N'Etapa 1 VERIFY falhou. Colunas ausentes: %s', 16, 1, @faltando);
    RETURN;
END

PRINT 'Etapa 1 VERIFY ok: colunas oficiais presentes.';
GO
