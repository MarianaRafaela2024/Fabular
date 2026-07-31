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
    public async Task<ApplicationResult<IEnumerable<ChildResponse>>> GetChildrenAsync(int responsavelId)
    {
        await using var conn = _db.Create();
        await conn.OpenAsync();

        var children = (await conn.QueryAsync<ChildResponse>(
            """
        SELECT
            c.Id,
            c.Nome,
            c.FaixaEtaria,
            c.DataNascimento,
            c.Avatar,
            c.GeneroFavorito
        FROM Crianca c
        INNER JOIN Responsavel_Crianca rc
            ON rc.Id_Crianca = c.Id
        WHERE rc.Id_Responsavel = @ResponsavelId
        ORDER BY c.Nome
        """,
            new { ResponsavelId = responsavelId })).ToList();

        var hoje = DateOnly.FromDateTime(DateTime.Today);
        foreach (var child in children)
        {
            if (!child.DataNascimento.HasValue)
            {
                continue;
            }

            var faixaCalculada = FaixaEtariaHelper.Calcular(child.DataNascimento, hoje);
            if (child.FaixaEtaria != faixaCalculada)
            {
                await conn.ExecuteAsync(
                    "UPDATE Crianca SET FaixaEtaria = @FaixaEtaria WHERE Id = @Id",
                    new { FaixaEtaria = faixaCalculada, child.Id });
                child.FaixaEtaria = faixaCalculada;
            }
        }

        return ApplicationResult<IEnumerable<ChildResponse>>.Ok(children);
    }

    public async Task<ApplicationResult<int>> CreateChildAsync(CreateChildRequest request)
    {
        if (!request.DataNascimento.HasValue)
        {
            return ApplicationResult<int>.BadRequest("Data de nascimento é obrigatória.");
        }

        var faixaEtaria = FaixaEtariaHelper.Calcular(request.DataNascimento);

        await using var conn = _db.Create();
        await conn.OpenAsync();

        var childId = await conn.QuerySingleAsync<int>(
            """
        INSERT INTO Crianca
            (Nome, FaixaEtaria, DataNascimento, Avatar, GeneroFavorito)
        OUTPUT INSERTED.Id
        VALUES
            (@Nome, @FaixaEtaria, @DataNascimento, @Avatar, @GeneroFavorito)
        """,
            new
            {
                Nome = request.Nome.Trim(),
                FaixaEtaria = faixaEtaria,
                request.DataNascimento,
                request.Avatar,
                request.GeneroFavorito
            });

        await conn.ExecuteAsync(
            """
        INSERT INTO Responsavel_Crianca
            (Id_Responsavel, Id_Crianca)
        VALUES
            (@ResponsavelId, @ChildId)
        """,
            new
            {
                request.ResponsavelId,
                ChildId = childId
            });

        return ApplicationResult<int>.Ok(childId);
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
            var faixaEtaria = child.DataNascimento.HasValue
                ? FaixaEtariaHelper.Calcular(child.DataNascimento)
                : (byte)Math.Clamp(child.FaixaEtaria, 1, 3);

            if (existing.HasValue)
            {
                childId = existing.Value;
                if (child.DataNascimento.HasValue)
                {
                    await conn.ExecuteAsync(
                        """
                        UPDATE Crianca
                        SET FaixaEtaria = @FaixaEtaria, DataNascimento = @DataNascimento
                        WHERE Id = @Id
                        """,
                        new { FaixaEtaria = faixaEtaria, child.DataNascimento, Id = childId },
                        tx);
                }
            }
            else
            {
                childId = await conn.QuerySingleAsync<int>(
                    """
                    INSERT INTO Crianca (Nome, FaixaEtaria, DataNascimento, Avatar, GeneroFavorito, LocalChildKey)
                    OUTPUT INSERTED.Id
                    VALUES (@Nome, @FaixaEtaria, @DataNascimento, @Avatar, @GeneroFavorito, @LocalChildKey)
                    """,
                    new
                    {
                        Nome = child.Nome.Trim(),
                        FaixaEtaria = faixaEtaria,
                        child.DataNascimento,
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
