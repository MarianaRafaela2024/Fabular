-- Etapa 11: palavras-chave em tabela. PalavrasChaveJson permanece.
-- JSON inválido é listado, não apagado. Idempotente por (Id_Historia, Ordem).

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Historia_PalavraChave', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Historia_PalavraChave (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Id_Historia INT NOT NULL,
        Palavra NVARCHAR(80) NOT NULL,
        Ordem TINYINT NOT NULL,
        CONSTRAINT FK_HPC_Historia FOREIGN KEY (Id_Historia) REFERENCES dbo.Historia (Id) ON DELETE CASCADE,
        CONSTRAINT UQ_HPC UNIQUE (Id_Historia, Ordem)
    );
END
GO

IF OBJECT_ID(N'dbo.Historia_PalavraChave', N'U') IS NOT NULL
BEGIN
    INSERT INTO dbo.Historia_PalavraChave (Id_Historia, Palavra, Ordem)
    SELECT
        h.Id,
        LEFT(LTRIM(RTRIM(j.value)), 80),
        CAST(TRY_CAST(j.[key] AS INT) + 1 AS TINYINT)
    FROM dbo.Historia AS h
    CROSS APPLY OPENJSON(h.PalavrasChaveJson) AS j
    WHERE h.PalavrasChaveJson IS NOT NULL
      AND LTRIM(RTRIM(h.PalavrasChaveJson)) <> N''
      AND ISJSON(h.PalavrasChaveJson) = 1
      AND LEFT(LTRIM(h.PalavrasChaveJson), 1) = N'['
      AND j.type = 1
      AND LTRIM(RTRIM(j.value)) <> N''
      AND TRY_CAST(j.[key] AS INT) BETWEEN 0 AND 254
      AND NOT EXISTS (
            SELECT 1
            FROM dbo.Historia_PalavraChave AS p
            WHERE p.Id_Historia = h.Id
              AND p.Ordem = CAST(TRY_CAST(j.[key] AS INT) + 1 AS TINYINT)
      );
END
GO

PRINT 'Etapa 11: PalavrasChaveJson inválido ou não-array (não migrado; coluna original intacta):';

SELECT h.Id, h.Titulo, LEFT(h.PalavrasChaveJson, 200) AS PalavrasChaveJson
FROM dbo.Historia AS h
WHERE h.PalavrasChaveJson IS NOT NULL
  AND LTRIM(RTRIM(h.PalavrasChaveJson)) <> N''
  AND (
        ISJSON(h.PalavrasChaveJson) = 0
        OR LEFT(LTRIM(h.PalavrasChaveJson), 1) <> N'['
      );
GO
