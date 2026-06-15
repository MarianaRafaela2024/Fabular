using System.Text.Json;
using API_Fabular.Contracts;
using API_Fabular.Infra;
using Dapper;

namespace API_Fabular.Services;
/**/
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

        await PersistirEstrelasPorHistoriaAsync(conn, request.CriancaId, request.ProgressoHistorias);

        return ApplicationResult<object>.Ok(new { syncStatus = "ok", lastServerStateVersion = DateTime.UtcNow.Ticks });
    }

    public async Task<ApplicationResult<ProgressResponseDto>> GetProgressAsync(int responsavelId, int criancaId)
    {
        if (responsavelId <= 0 || criancaId <= 0)
        {
            return ApplicationResult<ProgressResponseDto>.BadRequest("responsavelId e criancaId são obrigatórios.");
        }

        await using var conn = _db.Create();

        var vinculo = await conn.ExecuteScalarAsync<int?>(
            """
            SELECT TOP 1 1
            FROM Responsavel_Crianca
            WHERE Id_Crianca = @CriancaId AND Id_Responsavel = @ResponsavelId
            """,
            new { CriancaId = criancaId, ResponsavelId = responsavelId });

        if (vinculo is null)
        {
            return ApplicationResult<ProgressResponseDto>.NotFound("Criança não encontrada para este responsável.");
        }

        var historiasMap = new Dictionary<string, HistoriaProgressoDto>(StringComparer.OrdinalIgnoreCase);
        var tempoTotal = 0;
        var minigamesJogados = 0;
        var tentativasReprovadas = 0;
        DateTime? updatedAt = null;

        var payloadRow = await conn.QueryFirstOrDefaultAsync<(string PayloadJson, DateTime UpdatedAt)?>(
            """
            SELECT TOP 1 PayloadJson, UpdatedAt
            FROM Sincronizacao_Progresso
            WHERE Id_Responsavel = @ResponsavelId AND Id_Crianca = @CriancaId
            ORDER BY UpdatedAt DESC
            """,
            new { ResponsavelId = responsavelId, CriancaId = criancaId });

        if (payloadRow.HasValue)
        {
            updatedAt = payloadRow.Value.UpdatedAt;
            MesclarPayloadNoMapa(payloadRow.Value.PayloadJson, historiasMap, ref tempoTotal, ref minigamesJogados, ref tentativasReprovadas);
        }

        var sessoes = await conn.QueryAsync<(int IdHistoria, int Estrelas, DateTime CriadoEm)>(
            """
            SELECT Id_Historia, MAX(Estrelas) AS Estrelas, MAX(CriadoEm) AS CriadoEm
            FROM Sessao_Leitura
            WHERE Id_Crianca = @CriancaId AND Concluida = 1
            GROUP BY Id_Historia
            """,
            new { CriancaId = criancaId });

        foreach (var sessao in sessoes)
        {
            var id = $"api-{sessao.IdHistoria}";
            var estrelas = Math.Clamp(sessao.Estrelas, 0, 3);
            if (estrelas <= 0)
            {
                continue;
            }

            if (historiasMap.TryGetValue(id, out var existente))
            {
                if (estrelas > existente.Estrelas)
                {
                    historiasMap[id] = existente with
                    {
                        Estrelas = estrelas,
                        Data = sessao.CriadoEm.ToString("dd/MM/yyyy")
                    };
                }
            }
            else
            {
                historiasMap[id] = new HistoriaProgressoDto(id, estrelas, sessao.CriadoEm.ToString("dd/MM/yyyy"));
            }
        }

        var historiasLidas = historiasMap.Values.OrderBy(h => h.Id).ToList();
        var totalEstrelas = historiasLidas.Sum(h => h.Estrelas);

        if (totalEstrelas == 0)
        {
            var estrelaCrianca = await conn.ExecuteScalarAsync<int?>(
                "SELECT Estrela FROM Crianca WHERE Id = @CriancaId",
                new { CriancaId = criancaId });
            if (estrelaCrianca.HasValue && estrelaCrianca.Value > 0)
            {
                totalEstrelas = estrelaCrianca.Value;
            }
        }

        return ApplicationResult<ProgressResponseDto>.Ok(new ProgressResponseDto(
            totalEstrelas,
            historiasLidas,
            tempoTotal,
            minigamesJogados,
            tentativasReprovadas,
            updatedAt));
    }

    private static void MesclarPayloadNoMapa(
        string payloadJson,
        Dictionary<string, HistoriaProgressoDto> historiasMap,
        ref int tempoTotal,
        ref int minigamesJogados,
        ref int tentativasReprovadas)
    {
        try
        {
            using var doc = JsonDocument.Parse(payloadJson);
            if (doc.RootElement.ValueKind != JsonValueKind.Object)
            {
                return;
            }

            if (doc.RootElement.TryGetProperty("ProgressoHistorias", out var progressoEl) ||
                doc.RootElement.TryGetProperty("progressoHistorias", out progressoEl))
            {
                tempoTotal = Math.Max(tempoTotal, ExtrairInt(progressoEl, "tempoTotal"));
                foreach (var item in ExtrairHistoriasLidas(progressoEl))
                {
                    if (string.IsNullOrWhiteSpace(item.Id) || item.Estrelas <= 0)
                    {
                        continue;
                    }

                    if (historiasMap.TryGetValue(item.Id, out var existente))
                    {
                        if (item.Estrelas > existente.Estrelas)
                        {
                            historiasMap[item.Id] = item;
                        }
                    }
                    else
                    {
                        historiasMap[item.Id] = item;
                    }
                }
            }

            if (doc.RootElement.TryGetProperty("ResumoMinigames", out var resumoEl) ||
                doc.RootElement.TryGetProperty("resumoMinigames", out resumoEl))
            {
                minigamesJogados = Math.Max(minigamesJogados, ExtrairInt(resumoEl, "minigamesJogados"));
                tentativasReprovadas = Math.Max(tentativasReprovadas, ExtrairInt(resumoEl, "tentativasReprovadas"));
            }
        }
        catch
        {
            // Payload inválido não impede retorno parcial via Sessao_Leitura.
        }
    }

    private async Task PersistirEstrelasPorHistoriaAsync(System.Data.Common.DbConnection conn, int criancaId, object progressoHistorias)
    {
        foreach (var historia in ExtrairHistoriasLidas(progressoHistorias))
        {
            if (!TryParseApiHistoriaId(historia.Id, out var historiaId) || historia.Estrelas <= 0)
            {
                continue;
            }

            var existeHistoria = await conn.ExecuteScalarAsync<int?>(
                "SELECT TOP 1 1 FROM Historia WHERE Id = @HistoriaId",
                new { HistoriaId = historiaId });
            if (existeHistoria is null)
            {
                continue;
            }

            var sessaoId = await conn.ExecuteScalarAsync<int?>(
                """
                SELECT TOP 1 Id
                FROM Sessao_Leitura
                WHERE Id_Crianca = @CriancaId AND Id_Historia = @HistoriaId AND Concluida = 1
                ORDER BY Estrelas DESC, CriadoEm DESC
                """,
                new { CriancaId = criancaId, HistoriaId = historiaId });

            if (sessaoId.HasValue)
            {
                await conn.ExecuteAsync(
                    """
                    UPDATE Sessao_Leitura
                    SET Estrelas = @Estrelas
                    WHERE Id = @Id AND Estrelas < @Estrelas
                    """,
                    new
                    {
                        Id = sessaoId.Value,
                        Estrelas = historia.Estrelas
                    });
            }
            else
            {
                await conn.ExecuteAsync(
                    """
                    INSERT INTO Sessao_Leitura (Id_Crianca, Id_Historia, Estrelas, Concluida)
                    VALUES (@CriancaId, @HistoriaId, @Estrelas, 1)
                    """,
                    new
                    {
                        CriancaId = criancaId,
                        HistoriaId = historiaId,
                        Estrelas = historia.Estrelas
                    });
            }
        }
    }

    private static List<HistoriaProgressoDto> ExtrairHistoriasLidas(object progressoHistorias)
    {
        var resultado = new List<HistoriaProgressoDto>();
        try
        {
            var json = JsonSerializer.Serialize(progressoHistorias);
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind != JsonValueKind.Object)
            {
                return resultado;
            }

            if (!doc.RootElement.TryGetProperty("historiasLidas", out var listaEl) &&
                !doc.RootElement.TryGetProperty("HistoriasLidas", out listaEl))
            {
                return resultado;
            }

            if (listaEl.ValueKind != JsonValueKind.Array)
            {
                return resultado;
            }

            foreach (var item in listaEl.EnumerateArray())
            {
                if (item.ValueKind != JsonValueKind.Object)
                {
                    continue;
                }

                var id = item.TryGetProperty("id", out var idEl) ? idEl.GetString()
                    : item.TryGetProperty("Id", out idEl) ? idEl.GetString() : null;
                if (string.IsNullOrWhiteSpace(id))
                {
                    continue;
                }

                var estrelas = 0;
                if (item.TryGetProperty("estrelas", out var estrelasEl) && estrelasEl.TryGetInt32(out var e))
                {
                    estrelas = Math.Clamp(e, 0, 3);
                }
                else if (item.TryGetProperty("Estrelas", out estrelasEl) && estrelasEl.TryGetInt32(out e))
                {
                    estrelas = Math.Clamp(e, 0, 3);
                }

                var data = item.TryGetProperty("data", out var dataEl) ? dataEl.GetString()
                    : item.TryGetProperty("Data", out dataEl) ? dataEl.GetString() : null;

                resultado.Add(new HistoriaProgressoDto(id, estrelas, data));
            }
        }
        catch
        {
            // Ignora payload inválido.
        }

        return resultado;
    }

    private static int ExtrairInt(JsonElement parent, string propertyName)
    {
        if (parent.ValueKind != JsonValueKind.Object)
        {
            return 0;
        }

        if (parent.TryGetProperty(propertyName, out var el) &&
            el.ValueKind == JsonValueKind.Number &&
            el.TryGetInt32(out var value))
        {
            return Math.Max(0, value);
        }

        var pascal = char.ToUpperInvariant(propertyName[0]) + propertyName[1..];
        if (parent.TryGetProperty(pascal, out el) &&
            el.ValueKind == JsonValueKind.Number &&
            el.TryGetInt32(out value))
        {
            return Math.Max(0, value);
        }

        return 0;
    }

    private static bool TryParseApiHistoriaId(string? storyId, out int historiaId)
    {
        historiaId = 0;
        if (string.IsNullOrWhiteSpace(storyId))
        {
            return false;
        }

        if (!storyId.StartsWith("api-", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return int.TryParse(storyId.AsSpan(4), out historiaId) && historiaId > 0;
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
