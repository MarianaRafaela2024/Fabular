-- Etapa 1 DOWN: no-op intencional.
-- DataNascimento, HorarioBrincar, HistoriasConcluidasJson e Id_Historia
-- já fazem parte do schema oficial (CriarBanco.sql). Removê-las quebraria a API.

SET NOCOUNT ON;
USE Fabular;
GO

PRINT '001_congelar_schema_implicito.down.sql: nenhuma coluna removida (colunas oficiais).';
GO
