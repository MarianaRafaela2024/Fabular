SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Crianca', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Crianca', N'HorarioBrincar') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Crianca ALTER COLUMN HorarioBrincar VARCHAR(10) NULL;
END
GO
