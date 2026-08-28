-- Etapa 8 DOWN: remove unique filtrado e restaura dados do backup (se existir).
-- A tabela Atividade_Diaria_Backup_008 permanece para auditoria.

SET NOCOUNT ON;
USE Fabular;
GO

IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UQ_AD_CriancaData_SemHistoria' AND object_id = OBJECT_ID(N'dbo.Atividade_Diaria')
)
    DROP INDEX UQ_AD_CriancaData_SemHistoria ON dbo.Atividade_Diaria;
GO

IF OBJECT_ID(N'dbo.Atividade_Diaria', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.Atividade_Diaria_Backup_008', N'U') IS NOT NULL
BEGIN
    DELETE FROM dbo.Atividade_Diaria;

    SET IDENTITY_INSERT dbo.Atividade_Diaria ON;

    INSERT INTO dbo.Atividade_Diaria (Id, Id_Crianca, Id_Historia, Data, HistoriasConcluidas)
    SELECT Id, Id_Crianca, Id_Historia, Data, HistoriasConcluidas
    FROM dbo.Atividade_Diaria_Backup_008;

    SET IDENTITY_INSERT dbo.Atividade_Diaria OFF;
END
GO
