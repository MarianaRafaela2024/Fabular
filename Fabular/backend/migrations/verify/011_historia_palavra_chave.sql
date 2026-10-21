-- Teste mínimo da etapa 11: tabela, unique e relatório de JSON inválido.

SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Historia_PalavraChave', N'U') IS NULL
BEGIN
    RAISERROR(N'Etapa 11 VERIFY falhou: Historia_PalavraChave ausente.', 16, 1);
END
ELSE IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UQ_HPC' AND object_id = OBJECT_ID(N'dbo.Historia_PalavraChave')
)
BEGIN
    RAISERROR(N'Etapa 11 VERIFY falhou: UQ_HPC ausente.', 16, 1);
END
ELSE
BEGIN
    DECLARE @jsonRuim INT = (
        SELECT COUNT(*)
        FROM dbo.Historia
        WHERE PalavrasChaveJson IS NOT NULL
          AND LTRIM(RTRIM(PalavrasChaveJson)) <> N''
          AND (ISJSON(PalavrasChaveJson) = 0 OR LEFT(LTRIM(PalavrasChaveJson), 1) <> N'[')
    );
    DECLARE @comTabela INT = (SELECT COUNT(DISTINCT Id_Historia) FROM dbo.Historia_PalavraChave);
    DECLARE @orfas INT = (
        SELECT COUNT(*)
        FROM dbo.Historia AS h
        WHERE h.PalavrasChaveJson IS NOT NULL
          AND ISJSON(h.PalavrasChaveJson) = 1
          AND LEFT(LTRIM(h.PalavrasChaveJson), 1) = N'['
          AND EXISTS (
                SELECT 1
                FROM OPENJSON(h.PalavrasChaveJson) AS j
                WHERE j.type = 1 AND LTRIM(RTRIM(j.value)) <> N''
          )
          AND NOT EXISTS (
                SELECT 1 FROM dbo.Historia_PalavraChave AS p WHERE p.Id_Historia = h.Id
          )
    );

    IF @orfas > 0
    BEGIN
        RAISERROR(N'Etapa 11 VERIFY falhou: %d história(s) com JSON válido sem linhas na tabela.', 16, 1, @orfas);
    END
    ELSE
    BEGIN
        PRINT 'Etapa 11 VERIFY ok: Historia_PalavraChave presente.';
        PRINT CONCAT(N'Histórias com palavras na tabela: ', @comTabela);
        PRINT CONCAT(N'JSON inválido/não-array (não migrado): ', @jsonRuim);
    END
END
GO
