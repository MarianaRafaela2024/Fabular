-- Etapa 8: Atividade_Diaria idempotente.
-- Backup reversível + recálculo a partir de Sessao_Leitura + unique filtrado para linhas sem história.
-- Idempotente: o backup só é criado na primeira aplicação.

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Atividade_Diaria', N'U') IS NULL
BEGIN
    RAISERROR(N'Etapa 8: tabela Atividade_Diaria não existe.', 16, 1);
END
GO

IF OBJECT_ID(N'dbo.Atividade_Diaria', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.Atividade_Diaria_Backup_008', N'U') IS NULL
    SELECT *
    INTO dbo.Atividade_Diaria_Backup_008
    FROM dbo.Atividade_Diaria;
GO

IF OBJECT_ID(N'dbo.Atividade_Diaria', N'U') IS NOT NULL
BEGIN
    UPDATE dbo.Atividade_Diaria
    SET HistoriasConcluidas = 1
    WHERE HistoriasConcluidas <> 1;
END
GO

IF OBJECT_ID(N'dbo.Atividade_Diaria', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.Sessao_Leitura', N'U') IS NOT NULL
BEGIN
    MERGE dbo.Atividade_Diaria AS alvo
    USING (
        SELECT Id_Crianca, Id_Historia, CAST(CriadoEm AS DATE) AS Data
        FROM dbo.Sessao_Leitura
        WHERE Concluida = 1
    ) AS origem
    ON alvo.Id_Crianca = origem.Id_Crianca
       AND alvo.Id_Historia = origem.Id_Historia
       AND alvo.Data = origem.Data
    WHEN MATCHED THEN
        UPDATE SET HistoriasConcluidas = 1
    WHEN NOT MATCHED THEN
        INSERT (Id_Crianca, Id_Historia, Data, HistoriasConcluidas)
        VALUES (origem.Id_Crianca, origem.Id_Historia, origem.Data, 1);
END
GO

IF OBJECT_ID(N'dbo.Atividade_Diaria', N'U') IS NOT NULL
   AND EXISTS (
        SELECT 1
        FROM dbo.Atividade_Diaria
        WHERE Id_Historia IS NULL
        GROUP BY Id_Crianca, Data
        HAVING COUNT(*) > 1
   )
BEGIN
    SELECT Id_Crianca, Data, COUNT(*) AS Quantidade
    FROM dbo.Atividade_Diaria
    WHERE Id_Historia IS NULL
    GROUP BY Id_Crianca, Data
    HAVING COUNT(*) > 1;

    RAISERROR(N'Etapa 8: várias linhas sem Id_Historia no mesmo dia. Unique filtrado não aplicado. Reporte este resultado.', 16, 1);
END
GO

IF OBJECT_ID(N'dbo.Atividade_Diaria', N'U') IS NOT NULL
   AND NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = N'UQ_AD_CriancaData_SemHistoria' AND object_id = OBJECT_ID(N'dbo.Atividade_Diaria')
   )
   AND NOT EXISTS (
        SELECT 1
        FROM dbo.Atividade_Diaria
        WHERE Id_Historia IS NULL
        GROUP BY Id_Crianca, Data
        HAVING COUNT(*) > 1
   )
BEGIN
    SET QUOTED_IDENTIFIER ON;
    CREATE UNIQUE INDEX UQ_AD_CriancaData_SemHistoria
        ON dbo.Atividade_Diaria (Id_Crianca, Data)
        WHERE Id_Historia IS NULL;
END
GO
