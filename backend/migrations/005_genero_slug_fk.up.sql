-- Etapa 5: catálogo Genero com Slug + FKs nullable em Historia/Crianca.
-- Não remove Historia.Genero nem Crianca.GeneroFavorito.
-- Alias: Cotidiano → instrucional (decisão explícita).
-- Idempotente.

SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Genero', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Genero', N'Slug') IS NULL
    ALTER TABLE dbo.Genero ADD Slug NVARCHAR(40) NULL;
GO

IF OBJECT_ID(N'dbo.Genero', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Genero', N'Slug') IS NOT NULL
BEGIN
    UPDATE dbo.Genero
    SET Slug = CASE
        WHEN Nome COLLATE Latin1_General_CI_AI = N'narrativo' THEN N'narrativo'
        WHEN Nome COLLATE Latin1_General_CI_AI = N'poetico' THEN N'poetico'
        WHEN Nome COLLATE Latin1_General_CI_AI = N'instrucional' THEN N'instrucional'
        WHEN Nome COLLATE Latin1_General_CI_AI = N'descritivo' THEN N'descritivo'
        WHEN Nome COLLATE Latin1_General_CI_AI = N'informativo' THEN N'informativo'
        ELSE NULL
    END
    WHERE Slug IS NULL;
END
GO

IF OBJECT_ID(N'dbo.Genero', N'U') IS NOT NULL
   AND EXISTS (SELECT 1 FROM dbo.Genero WHERE Slug IS NULL)
BEGIN
    SELECT Id, Nome AS GeneroNomeNaoMapeado
    FROM dbo.Genero
    WHERE Slug IS NULL;

    RAISERROR(N'Etapa 5: existem linhas em Genero sem slug canônico. Backfill interrompido antes de NOT NULL/UNIQUE.', 16, 1);
END
GO

IF OBJECT_ID(N'dbo.Genero', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Genero', N'Slug') IS NOT NULL
    ALTER TABLE dbo.Genero ALTER COLUMN Slug NVARCHAR(40) NOT NULL;
GO

IF OBJECT_ID(N'dbo.Genero', N'U') IS NOT NULL
   AND NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = N'UQ_Genero_Slug' AND object_id = OBJECT_ID(N'dbo.Genero')
    )
    ALTER TABLE dbo.Genero ADD CONSTRAINT UQ_Genero_Slug UNIQUE (Slug);
GO

IF OBJECT_ID(N'dbo.Historia', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Historia', N'Id_Genero') IS NULL
    ALTER TABLE dbo.Historia ADD Id_Genero INT NULL;
GO

IF OBJECT_ID(N'dbo.Crianca', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Crianca', N'Id_GeneroFavorito') IS NULL
    ALTER TABLE dbo.Crianca ADD Id_GeneroFavorito INT NULL;
GO

IF OBJECT_ID(N'dbo.Historia', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Historia', N'Id_Genero') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Historia_Genero')
    ALTER TABLE dbo.Historia ADD CONSTRAINT FK_Historia_Genero
        FOREIGN KEY (Id_Genero) REFERENCES dbo.Genero (Id);
GO

IF OBJECT_ID(N'dbo.Crianca', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Crianca', N'Id_GeneroFavorito') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Crianca_GeneroFavorito')
    ALTER TABLE dbo.Crianca ADD CONSTRAINT FK_Crianca_GeneroFavorito
        FOREIGN KEY (Id_GeneroFavorito) REFERENCES dbo.Genero (Id);
GO

IF OBJECT_ID(N'dbo.Historia', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Historia', N'Id_Genero') IS NOT NULL
BEGIN
    UPDATE h
    SET h.Id_Genero = g.Id
    FROM dbo.Historia AS h
    INNER JOIN dbo.Genero AS g
        ON g.Slug = CASE
            WHEN h.Genero COLLATE Latin1_General_CI_AI = N'cotidiano' THEN N'instrucional'
            WHEN h.Genero COLLATE Latin1_General_CI_AI = N'narrativo' THEN N'narrativo'
            WHEN h.Genero COLLATE Latin1_General_CI_AI = N'poetico' THEN N'poetico'
            WHEN h.Genero COLLATE Latin1_General_CI_AI = N'instrucional' THEN N'instrucional'
            WHEN h.Genero COLLATE Latin1_General_CI_AI = N'descritivo' THEN N'descritivo'
            WHEN h.Genero COLLATE Latin1_General_CI_AI = N'informativo' THEN N'informativo'
            ELSE NULL
        END
    WHERE h.Id_Genero IS NULL;
END
GO

IF OBJECT_ID(N'dbo.Crianca', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Crianca', N'Id_GeneroFavorito') IS NOT NULL
BEGIN
    UPDATE c
    SET c.Id_GeneroFavorito = g.Id
    FROM dbo.Crianca AS c
    INNER JOIN dbo.Genero AS g
        ON g.Slug = CASE
            WHEN c.GeneroFavorito COLLATE Latin1_General_CI_AI = N'cotidiano' THEN N'instrucional'
            WHEN c.GeneroFavorito COLLATE Latin1_General_CI_AI = N'narrativo' THEN N'narrativo'
            WHEN c.GeneroFavorito COLLATE Latin1_General_CI_AI = N'poetico' THEN N'poetico'
            WHEN c.GeneroFavorito COLLATE Latin1_General_CI_AI = N'instrucional' THEN N'instrucional'
            WHEN c.GeneroFavorito COLLATE Latin1_General_CI_AI = N'descritivo' THEN N'descritivo'
            WHEN c.GeneroFavorito COLLATE Latin1_General_CI_AI = N'informativo' THEN N'informativo'
            ELSE NULL
        END
    WHERE c.Id_GeneroFavorito IS NULL
      AND c.GeneroFavorito IS NOT NULL
      AND LTRIM(RTRIM(c.GeneroFavorito)) <> N'';
END
GO

PRINT 'Etapa 5 UP: colunas e FKs aplicadas. Backfill dos mapeáveis concluído.';
PRINT 'Histórias sem Id_Genero (órfãos — não mapeados automaticamente):';

SELECT h.Id, h.Titulo, h.Genero
FROM dbo.Historia AS h
WHERE h.Id_Genero IS NULL;

PRINT 'Crianças com GeneroFavorito preenchido e sem Id_GeneroFavorito:';

SELECT c.Id, c.Nome, c.GeneroFavorito
FROM dbo.Crianca AS c
WHERE c.Id_GeneroFavorito IS NULL
  AND c.GeneroFavorito IS NOT NULL
  AND LTRIM(RTRIM(c.GeneroFavorito)) <> N'';
GO
