-- Etapa 10: snapshot do progresso atual (1 linha por responsável/criança).
-- O log Sincronizacao_Progresso permanece (append-only).
-- Idempotente.

SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Progresso_Snapshot', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Progresso_Snapshot (
        Id_Responsavel INT NOT NULL,
        Id_Crianca INT NOT NULL,
        PayloadJson NVARCHAR(MAX) NOT NULL,
        UpdatedAt DATETIME2 NOT NULL,
        CONSTRAINT PK_Progresso_Snapshot PRIMARY KEY (Id_Responsavel, Id_Crianca),
        CONSTRAINT FK_PSnap_Responsavel FOREIGN KEY (Id_Responsavel) REFERENCES dbo.Responsavel (Id),
        CONSTRAINT FK_PSnap_Crianca FOREIGN KEY (Id_Crianca) REFERENCES dbo.Crianca (Id)
    );
END
GO

IF OBJECT_ID(N'dbo.Progresso_Snapshot', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.Sincronizacao_Progresso', N'U') IS NOT NULL
BEGIN
    INSERT INTO dbo.Progresso_Snapshot (Id_Responsavel, Id_Crianca, PayloadJson, UpdatedAt)
    SELECT x.Id_Responsavel, x.Id_Crianca, x.PayloadJson, x.UpdatedAt
    FROM (
        SELECT
            Id_Responsavel,
            Id_Crianca,
            PayloadJson,
            UpdatedAt,
            ROW_NUMBER() OVER (
                PARTITION BY Id_Responsavel, Id_Crianca
                ORDER BY UpdatedAt DESC, Id DESC
            ) AS rn
        FROM dbo.Sincronizacao_Progresso
    ) AS x
    WHERE x.rn = 1
      AND NOT EXISTS (
            SELECT 1
            FROM dbo.Progresso_Snapshot AS p
            WHERE p.Id_Responsavel = x.Id_Responsavel
              AND p.Id_Crianca = x.Id_Crianca
      );
END
GO
