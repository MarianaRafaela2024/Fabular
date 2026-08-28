# Migrations — Fabular

Scripts incrementais para bancos **já existentes**. Instalações do zero continuam usando `backend/CriarBanco.sql`.

## Como aplicar

Ordem numérica. Cada etapa tem `NNN_*.up.sql` e `NNN_*.down.sql`.

```bash
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/001_congelar_schema_implicito.up.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/004_indices_ia_evento.up.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/005_genero_slug_fk.up.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/007_sessao_unique.up.sql
```

Verificação opcional:

```bash
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/verify/001_congelar_schema_implicito.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/verify/004_indices_ia_evento.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/verify/005_genero_slug_fk.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d Fabular -i backend/migrations/verify/007_sessao_unique.sql
```

## Regras

- Nunca editar um `.up.sql` já aplicado em produção. Abra um número novo.
- `down.sql` desta etapa 001 é no-op: as colunas já fazem parte do schema oficial.
- Não rode `CriarBanco.sql` em banco com dados — ele dá DROP em todas as tabelas.
