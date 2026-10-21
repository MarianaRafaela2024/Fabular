-- Etapa 12: fases em tabela. PayloadJson permanece.
-- Backfill: PayloadJson.fases[]; se não houver fases, uma fase com TextoHtml.
-- JSON inválido é listado, não apagado. Idempotente por (Id_Historia, Ordem).

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Historia_Fase', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Historia_Fase (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Id_Historia INT NOT NULL,
        Ordem TINYINT NOT NULL,
        TextoHtml NVARCHAR(MAX) NOT NULL,
        Cena NVARCHAR(40) NULL,
        CONSTRAINT FK_HF_Historia FOREIGN KEY (Id_Historia) REFERENCES dbo.Historia (Id) ON DELETE CASCADE,
        CONSTRAINT UQ_HF UNIQUE (Id_Historia, Ordem)
    );
END
GO

-- Fases a partir de PayloadJson.fases[] (camelCase ou PascalCase).
IF OBJECT_ID(N'dbo.Historia_Fase', N'U') IS NOT NULL
BEGIN
    INSERT INTO dbo.Historia_Fase (Id_Historia, Ordem, TextoHtml, Cena)
    SELECT
        h.Id,
        CAST(TRY_CAST(j.[key] AS INT) + 1 AS TINYINT),
        LTRIM(RTRIM(CASE
            WHEN j.type = 1 THEN j.value
            WHEN j.type = 5 THEN COALESCE(
                JSON_VALUE(j.value, N'$.texto'),
                JSON_VALUE(j.value, N'$.Texto'),
                JSON_VALUE(j.value, N'$.textoHtml'),
                JSON_VALUE(j.value, N'$.TextoHtml')
            )
            ELSE NULL
        END)),
        LEFT(NULLIF(LTRIM(RTRIM(COALESCE(
            CASE WHEN j.type = 5 THEN COALESCE(JSON_VALUE(j.value, N'$.cena'), JSON_VALUE(j.value, N'$.Cena')) END,
            h.Cena
        ))), N''), 40)
    FROM dbo.Historia AS h
    CROSS APPLY OPENJSON(
        COALESCE(JSON_QUERY(h.PayloadJson, N'$.fases'), JSON_QUERY(h.PayloadJson, N'$.Fases'))
    ) AS j
    WHERE h.PayloadJson IS NOT NULL
      AND LTRIM(RTRIM(h.PayloadJson)) <> N''
      AND ISJSON(h.PayloadJson) = 1
      AND TRY_CAST(j.[key] AS INT) BETWEEN 0 AND 254
      AND LTRIM(RTRIM(CASE
            WHEN j.type = 1 THEN j.value
            WHEN j.type = 5 THEN COALESCE(
                JSON_VALUE(j.value, N'$.texto'),
                JSON_VALUE(j.value, N'$.Texto'),
                JSON_VALUE(j.value, N'$.textoHtml'),
                JSON_VALUE(j.value, N'$.TextoHtml')
            )
            ELSE NULL
        END)) <> N''
      AND NOT EXISTS (
            SELECT 1
            FROM dbo.Historia_Fase AS f
            WHERE f.Id_Historia = h.Id
              AND f.Ordem = CAST(TRY_CAST(j.[key] AS INT) + 1 AS TINYINT)
      );
END
GO

-- Sem fases extraídas: uma fase com TextoHtml (inclui payload IA sem fases[] e JSON inválido).
IF OBJECT_ID(N'dbo.Historia_Fase', N'U') IS NOT NULL
BEGIN
    INSERT INTO dbo.Historia_Fase (Id_Historia, Ordem, TextoHtml, Cena)
    SELECT h.Id, CAST(1 AS TINYINT), h.TextoHtml, LEFT(NULLIF(LTRIM(RTRIM(h.Cena)), N''), 40)
    FROM dbo.Historia AS h
    WHERE LTRIM(RTRIM(h.TextoHtml)) <> N''
      AND NOT EXISTS (
            SELECT 1 FROM dbo.Historia_Fase AS f WHERE f.Id_Historia = h.Id
      );
END
GO

PRINT 'Etapa 12: PayloadJson inválido (não parseado como fases; TextoHtml usado se a história ainda não tinha fase):';

SELECT h.Id, h.Titulo, LEFT(h.PayloadJson, 200) AS PayloadJson
FROM dbo.Historia AS h
WHERE h.PayloadJson IS NOT NULL
  AND LTRIM(RTRIM(h.PayloadJson)) <> N''
  AND ISJSON(h.PayloadJson) = 0;
GO

PRINT 'Etapa 12: PayloadJson com fases que não é array (não migrado a partir do blob):';

SELECT h.Id, h.Titulo, LEFT(h.PayloadJson, 200) AS PayloadJson
FROM dbo.Historia AS h
WHERE h.PayloadJson IS NOT NULL
  AND ISJSON(h.PayloadJson) = 1
  AND (
        JSON_QUERY(h.PayloadJson, N'$.fases') IS NOT NULL
        OR JSON_QUERY(h.PayloadJson, N'$.Fases') IS NOT NULL
      )
  AND LEFT(LTRIM(COALESCE(JSON_QUERY(h.PayloadJson, N'$.fases'), JSON_QUERY(h.PayloadJson, N'$.Fases'))), 1) <> N'[';
GO
