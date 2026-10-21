-- Etapa 7: uma sessão canônica por (criança, história).
-- AcertosTotal, ErrosTotal, AjudasTotal permanecem (deprecated: nunca escritos pela API).
-- Idempotente. Falha se houver duplicatas — não mescla automaticamente.

SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Sessao_Leitura', N'U') IS NULL
BEGIN
    RAISERROR(N'Etapa 7: tabela Sessao_Leitura não existe.', 16, 1);
END
GO

IF OBJECT_ID(N'dbo.Sessao_Leitura', N'U') IS NOT NULL
   AND EXISTS (
        SELECT 1
        FROM dbo.Sessao_Leitura
        GROUP BY Id_Crianca, Id_Historia
        HAVING COUNT(*) > 1
   )
BEGIN
    SELECT Id_Crianca, Id_Historia, COUNT(*) AS Quantidade,
           MAX(Estrelas) AS EstrelasMax, MIN(CriadoEm) AS Primeira, MAX(CriadoEm) AS Ultima
    FROM dbo.Sessao_Leitura
    GROUP BY Id_Crianca, Id_Historia
    HAVING COUNT(*) > 1;

    RAISERROR(N'Etapa 7: duplicatas em Sessao_Leitura (Id_Crianca, Id_Historia). Unique não aplicado. Reporte este resultado antes de mesclar.', 16, 1);
END
GO

IF OBJECT_ID(N'dbo.Sessao_Leitura', N'U') IS NOT NULL
   AND NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = N'UQ_SL_CriancaHistoria' AND object_id = OBJECT_ID(N'dbo.Sessao_Leitura')
   )
   AND NOT EXISTS (
        SELECT 1
        FROM dbo.Sessao_Leitura
        GROUP BY Id_Crianca, Id_Historia
        HAVING COUNT(*) > 1
   )
    ALTER TABLE dbo.Sessao_Leitura
        ADD CONSTRAINT UQ_SL_CriancaHistoria UNIQUE (Id_Crianca, Id_Historia);
GO
