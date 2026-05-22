using API_Fabular.Contracts;
using API_Fabular.Infra;
using Dapper;

namespace API_Fabular.Services;

public class ChildrenLinkService
{
    private readonly DbConnectionFactory _db;

    public ChildrenLinkService(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<ApplicationResult<object>> LinkLocalAsync(LinkLocalChildrenRequest request)
    {
        if (request.ResponsavelId <= 0 || request.ChildrenLocal is null || request.ChildrenLocal.Count == 0)
        {
            return ApplicationResult<object>.BadRequest("Responsável e crianças locais são obrigatórios.");
        }

        await using var conn = _db.Create();
        await conn.OpenAsync();
        await using var tx = await conn.BeginTransactionAsync();
        var linked = new List<LinkedChildDto>();

        foreach (var child in request.ChildrenLocal)
        {
            if (string.IsNullOrWhiteSpace(child.LocalChildKey) || string.IsNullOrWhiteSpace(child.Nome))
            {
                continue;
            }

            var existing = await conn.QueryFirstOrDefaultAsync<int?>(
                """
                SELECT TOP 1 c.Id
                FROM Crianca c
                INNER JOIN Responsavel_Crianca rc ON rc.Id_Crianca = c.Id
                WHERE rc.Id_Responsavel = @ResponsavelId
                  AND c.LocalChildKey = @LocalChildKey
                """,
                new { request.ResponsavelId, child.LocalChildKey },
                tx);

            int childId;
            var status = "reused";
            if (existing.HasValue)
            {
                childId = existing.Value;
            }
            else
            {
                childId = await conn.QuerySingleAsync<int>(
                    """
                    INSERT INTO Crianca (Nome, FaixaEtaria, Avatar, GeneroFavorito, LocalChildKey)
                    OUTPUT INSERTED.Id
                    VALUES (@Nome, @FaixaEtaria, @Avatar, @GeneroFavorito, @LocalChildKey)
                    """,
                    new
                    {
                        Nome = child.Nome.Trim(),
                        FaixaEtaria = Math.Clamp(child.FaixaEtaria, 1, 3),
                        child.Avatar,
                        child.GeneroFavorito,
                        child.LocalChildKey
                    },
                    tx);

                await conn.ExecuteAsync(
                    "INSERT INTO Responsavel_Crianca (Id_Responsavel, Id_Crianca) VALUES (@ResponsavelId, @ChildId)",
                    new { request.ResponsavelId, ChildId = childId },
                    tx);
                status = "created";
            }

            linked.Add(new LinkedChildDto(child.LocalChildKey, childId, status));
        }

        await tx.CommitAsync();
        return ApplicationResult<object>.Ok(new { linkedChildren = linked });
    }
}
