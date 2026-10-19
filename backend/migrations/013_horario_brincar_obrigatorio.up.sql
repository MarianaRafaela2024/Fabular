-- Horário de brincar é obrigatório na API. A coluna hoje permite NULL
-- (cadastros antigos). Este script só aplica NOT NULL se não houver vazio.
-- Se ainda existirem linhas sem horário, preencha-as e rode de novo, por exemplo:
--   UPDATE dbo.Crianca SET HorarioBrincar = '18:00'
--   WHERE HorarioBrincar IS NULL OR LTRIM(RTRIM(HorarioBrincar)) = '';

SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Crianca', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Crianca', N'HorarioBrincar') IS NOT NULL
   AND NOT EXISTS (
        SELECT 1
        FROM dbo.Crianca
        WHERE HorarioBrincar IS NULL OR LTRIM(RTRIM(HorarioBrincar)) = N''
   )
BEGIN
    ALTER TABLE dbo.Crianca ALTER COLUMN HorarioBrincar VARCHAR(10) NOT NULL;
END
GO
