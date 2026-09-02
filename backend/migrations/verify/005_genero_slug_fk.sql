-- Teste mínimo da etapa 5: Slug, unique, FKs e relatório de órfãos.

SET NOCOUNT ON;
USE Fabular;
GO

DECLARE @faltando NVARCHAR(400) = N'';

IF COL_LENGTH(N'dbo.Genero', N'Slug') IS NULL
    SET @faltando = @faltando + N'Genero.Slug; ';
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_Genero_Slug' AND object_id = OBJECT_ID(N'dbo.Genero'))
    SET @faltando = @faltando + N'UQ_Genero_Slug; ';
IF COL_LENGTH(N'dbo.Historia', N'Id_Genero') IS NULL
    SET @faltando = @faltando + N'Historia.Id_Genero; ';
IF COL_LENGTH(N'dbo.Crianca', N'Id_GeneroFavorito') IS NULL
    SET @faltando = @faltando + N'Crianca.Id_GeneroFavorito; ';
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Historia_Genero')
    SET @faltando = @faltando + N'FK_Historia_Genero; ';
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Crianca_GeneroFavorito')
    SET @faltando = @faltando + N'FK_Crianca_GeneroFavorito; ';

IF @faltando <> N''
BEGIN
    RAISERROR(N'Etapa 5 VERIFY falhou. Ausentes: %s', 16, 1, @faltando);
END
ELSE IF EXISTS (SELECT 1 FROM dbo.Genero WHERE Slug IS NULL OR LTRIM(RTRIM(Slug)) = N'')
BEGIN
    RAISERROR(N'Etapa 5 VERIFY falhou: Genero.Slug nulo ou vazio.', 16, 1);
END
ELSE
BEGIN
    DECLARE @histOrfas INT = (SELECT COUNT(*) FROM dbo.Historia WHERE Id_Genero IS NULL);
    DECLARE @criOrfas INT = (
        SELECT COUNT(*)
        FROM dbo.Crianca
        WHERE Id_GeneroFavorito IS NULL
          AND GeneroFavorito IS NOT NULL
          AND LTRIM(RTRIM(GeneroFavorito)) <> N''
    );

    PRINT 'Etapa 5 VERIFY ok: Slug + FKs presentes.';
    PRINT CONCAT(N'Órfãos Historia.Id_Genero NULL: ', @histOrfas);
    PRINT CONCAT(N'Órfãos Crianca (favorito preenchido sem FK): ', @criOrfas);

    IF @histOrfas > 0 OR @criOrfas > 0
    BEGIN
        SELECT Id, Titulo, Genero FROM dbo.Historia WHERE Id_Genero IS NULL;
        SELECT Id, Nome, GeneroFavorito
        FROM dbo.Crianca
        WHERE Id_GeneroFavorito IS NULL
          AND GeneroFavorito IS NOT NULL
          AND LTRIM(RTRIM(GeneroFavorito)) <> N'';
    END
END
GO
