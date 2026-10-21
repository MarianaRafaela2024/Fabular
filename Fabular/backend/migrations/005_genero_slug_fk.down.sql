-- Etapa 5 DOWN: remove FKs e colunas novas. Strings Historia.Genero / Crianca.GeneroFavorito permanecem.

SET NOCOUNT ON;
USE Fabular;
GO

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Historia_Genero')
    ALTER TABLE dbo.Historia DROP CONSTRAINT FK_Historia_Genero;
GO

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Crianca_GeneroFavorito')
    ALTER TABLE dbo.Crianca DROP CONSTRAINT FK_Crianca_GeneroFavorito;
GO

IF COL_LENGTH(N'dbo.Historia', N'Id_Genero') IS NOT NULL
    ALTER TABLE dbo.Historia DROP COLUMN Id_Genero;
GO

IF COL_LENGTH(N'dbo.Crianca', N'Id_GeneroFavorito') IS NOT NULL
    ALTER TABLE dbo.Crianca DROP COLUMN Id_GeneroFavorito;
GO

IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UQ_Genero_Slug' AND object_id = OBJECT_ID(N'dbo.Genero')
)
    ALTER TABLE dbo.Genero DROP CONSTRAINT UQ_Genero_Slug;
GO

IF COL_LENGTH(N'dbo.Genero', N'Slug') IS NOT NULL
    ALTER TABLE dbo.Genero DROP COLUMN Slug;
GO
