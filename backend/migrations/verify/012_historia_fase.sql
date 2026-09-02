-- Teste mínimo da etapa 12: tabela, unique, toda história com TextoHtml tem fase.

SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Historia_Fase', N'U') IS NULL
BEGIN
    RAISERROR(N'Etapa 12 VERIFY falhou: Historia_Fase ausente.', 16, 1);
END
ELSE IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UQ_HF' AND object_id = OBJECT_ID(N'dbo.Historia_Fase')
)
BEGIN
    RAISERROR(N'Etapa 12 VERIFY falhou: UQ_HF ausente.', 16, 1);
END
ELSE
BEGIN
    DECLARE @jsonRuim INT = (
        SELECT COUNT(*)
        FROM dbo.Historia
        WHERE PayloadJson IS NOT NULL
          AND LTRIM(RTRIM(PayloadJson)) <> N''
          AND ISJSON(PayloadJson) = 0
    );
    DECLARE @comTabela INT = (SELECT COUNT(DISTINCT Id_Historia) FROM dbo.Historia_Fase);
    DECLARE @orfas INT = (
        SELECT COUNT(*)
        FROM dbo.Historia AS h
        WHERE LTRIM(RTRIM(h.TextoHtml)) <> N''
          AND NOT EXISTS (
                SELECT 1 FROM dbo.Historia_Fase AS f WHERE f.Id_Historia = h.Id
          )
    );
    DECLARE @fasesPayloadSemLinha INT = (
        SELECT COUNT(*)
        FROM dbo.Historia AS h
        WHERE h.PayloadJson IS NOT NULL
          AND ISJSON(h.PayloadJson) = 1
          AND LEFT(LTRIM(COALESCE(JSON_QUERY(h.PayloadJson, N'$.fases'), JSON_QUERY(h.PayloadJson, N'$.Fases'))), 1) = N'['
          AND EXISTS (
                SELECT 1
                FROM OPENJSON(COALESCE(JSON_QUERY(h.PayloadJson, N'$.fases'), JSON_QUERY(h.PayloadJson, N'$.Fases'))) AS j
                WHERE LTRIM(RTRIM(CASE
                    WHEN j.type = 1 THEN j.value
                    WHEN j.type = 5 THEN COALESCE(
                        JSON_VALUE(j.value, N'$.texto'),
                        JSON_VALUE(j.value, N'$.Texto'),
                        JSON_VALUE(j.value, N'$.textoHtml'),
                        JSON_VALUE(j.value, N'$.TextoHtml')
                    )
                    ELSE NULL
                END)) <> N''
          )
          AND NOT EXISTS (
                SELECT 1 FROM dbo.Historia_Fase AS f WHERE f.Id_Historia = h.Id
          )
    );

    IF @orfas > 0
    BEGIN
        RAISERROR(N'Etapa 12 VERIFY falhou: %d história(s) com TextoHtml sem linhas em Historia_Fase.', 16, 1, @orfas);
    END
    ELSE IF @fasesPayloadSemLinha > 0
    BEGIN
        RAISERROR(N'Etapa 12 VERIFY falhou: %d história(s) com fases[] válido sem linhas na tabela.', 16, 1, @fasesPayloadSemLinha);
    END
    ELSE
    BEGIN
        PRINT 'Etapa 12 VERIFY ok: Historia_Fase presente.';
        PRINT CONCAT(N'Histórias com fases na tabela: ', @comTabela);
        PRINT CONCAT(N'JSON inválido (não parseado como fases): ', @jsonRuim);
    END
END
GO
