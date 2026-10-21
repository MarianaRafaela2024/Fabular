-- Etapa 7 DOWN: remove o unique. Dados e colunas deprecated permanecem.

SET NOCOUNT ON;
USE Fabular;
GO

IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UQ_SL_CriancaHistoria' AND object_id = OBJECT_ID(N'dbo.Sessao_Leitura')
)
    ALTER TABLE dbo.Sessao_Leitura DROP CONSTRAINT UQ_SL_CriancaHistoria;
GO
