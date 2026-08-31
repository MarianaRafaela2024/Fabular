# Migrations — Fabular

Scripts incrementais para bancos **já existentes**. Instalações do zero continuam usando `backend/CriarBanco.sql`.

## Como aplicar

Ordem numérica. Cada etapa tem `NNN_*.up.sql` e `NNN_*.down.sql`.

```bash
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/001_congelar_schema_implicito.up.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/004_indices_ia_evento.up.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/005_genero_slug_fk.up.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/007_sessao_unique.up.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/008_atividade_diaria_idempotente.up.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/010_progresso_snapshot.up.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/011_historia_palavra_chave.up.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/012_historia_fase.up.sql
```

Verificação opcional:

```bash
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/verify/001_congelar_schema_implicito.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/verify/004_indices_ia_evento.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/verify/005_genero_slug_fk.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/verify/007_sessao_unique.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/verify/008_atividade_diaria_idempotente.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/verify/010_progresso_snapshot.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/verify/011_historia_palavra_chave.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/verify/012_historia_fase.sql
```

## Regras

- Nunca editar um `.up.sql` já aplicado em produção. Abra um número novo.
- `down.sql` desta etapa 001 é no-op: as colunas já fazem parte do schema oficial.
- Não rode `CriarBanco.sql` em banco com dados — ele dá DROP em todas as tabelas.
