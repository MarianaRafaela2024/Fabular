using System.Text.Json;
using API_Fabular.Contracts;
using API_Fabular.Infra;
using Dapper;

namespace API_Fabular.Services;

public class ProgressSyncService
{
    private readonly DbConnectionFactory _db;

    public ProgressSyncService(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<ApplicationResult<object>> SyncProgressAsync(SyncProgressRequest request)
    {
        if (request.ResponsavelId <= 0 || request.CriancaId <= 0)
        {
            return ApplicationResult<object>.BadRequest("responsavelId e criancaId são obrigatórios.");
        }

        await using var conn = _db.Create();
        var payloadJson = JsonSerializer.Serialize(new
        {
            request.FaixaEtaria,
            request.ProgressoHistorias,
            request.ResumoMinigames
        });

        await conn.ExecuteAsync(
            """
            INSERT INTO Sincronizacao_Progresso (Id_Responsavel, Id_Crianca, PayloadJson, UpdatedAt)
            VALUES (@ResponsavelId, @CriancaId, @PayloadJson, @UpdatedAt)
            """,
            new
            {
                request.ResponsavelId,
                request.CriancaId,
                PayloadJson = payloadJson,
                request.UpdatedAt
            });

        var totalEstrelas = ExtrairTotalEstrelas(request.ProgressoHistorias);
        if (totalEstrelas >= 0)
        {
            await conn.ExecuteAsync(
                """
                UPDATE Crianca
                SET Estrela = @TotalEstrelas
                WHERE Id = @CriancaId
                """,
                new
                {
                    TotalEstrelas = totalEstrelas,
                    request.CriancaId
                });
        }

        return ApplicationResult<object>.Ok(new { syncStatus = "ok", lastServerStateVersion = DateTime.UtcNow.Ticks });
    }

    private static int ExtrairTotalEstrelas(object progressoHistorias)
    {
        try
        {
            var json = JsonSerializer.Serialize(progressoHistorias);
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind != JsonValueKind.Object)
            {
                return -1;
            }

            if (doc.RootElement.TryGetProperty("totalEstrelas", out var estrelasEl) &&
                estrelasEl.ValueKind == JsonValueKind.Number &&
                estrelasEl.TryGetInt32(out var estrelas))
            {
                return Math.Max(0, estrelas);
            }
        }
        catch
        {
            // Falha de parsing não deve interromper o sync principal.
        }

        return -1;
    }
}
