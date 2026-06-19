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
        await PersistirAtividadeDiariaAsync(conn, request.CriancaId, request.ProgressoHistorias);
        await PersistirRelatorioCriancaAsync(conn, request.CriancaId, request.ResumoMinigames);

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
        var acertosMG = 0;
        var errosMG = 0;
        var naoConsigoOuvir = 0;
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
            MesclarPayloadNoMapa(payloadRow.Value.PayloadJson, historiasMap, ref tempoTotal, ref minigamesJogados, ref tentativasReprovadas, ref acertosMG, ref errosMG, ref naoConsigoOuvir);
        }

        var relatorioDb = await CarregarRelatorioCriancaAsync(conn, criancaId);
        if (relatorioDb.HasValue)
        {
            tentativasReprovadas = Math.Max(tentativasReprovadas, relatorioDb.Value.TentativasReprovadas);
            acertosMG = Math.Max(acertosMG, relatorioDb.Value.AcertosMG);
            errosMG = Math.Max(errosMG, relatorioDb.Value.ErrosMG);
            naoConsigoOuvir = Math.Max(naoConsigoOuvir, relatorioDb.Value.NaoConsigoOuvir);
            updatedAt = updatedAt.HasValue
                ? (relatorioDb.Value.UpdatedAt > updatedAt.Value ? relatorioDb.Value.UpdatedAt : updatedAt)
                : relatorioDb.Value.UpdatedAt;
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
                        Data = sessao.CriadoEm.ToString("dd/MM/yyyy"),
                        DataIso = sessao.CriadoEm.ToString("yyyy-MM-dd")
                    };
                }
            }
            else
            {
                historiasMap[id] = new HistoriaProgressoDto(
                    id,
                    estrelas,
                    sessao.CriadoEm.ToString("dd/MM/yyyy"),
                    sessao.CriadoEm.ToString("yyyy-MM-dd"));
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

        var atividadeDiaria = await CarregarAtividadeDiariaAsync(conn, criancaId, historiasLidas);

        return ApplicationResult<ProgressResponseDto>.Ok(new ProgressResponseDto(
            totalEstrelas,
            historiasLidas,
            tempoTotal,
            minigamesJogados,
            tentativasReprovadas,
            acertosMG,
            errosMG,
            naoConsigoOuvir,
            atividadeDiaria,
            updatedAt));
    }

    private static void MesclarPayloadNoMapa(
        string payloadJson,
        Dictionary<string, HistoriaProgressoDto> historiasMap,
        ref int tempoTotal,
        ref int minigamesJogados,
        ref int tentativasReprovadas,
        ref int acertosMG,
        ref int errosMG,
        ref int naoConsigoOuvir)
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
                acertosMG = Math.Max(acertosMG, ExtrairInt(resumoEl, "acertosMG"));
                errosMG = Math.Max(errosMG, ExtrairInt(resumoEl, "errosMG"));
                naoConsigoOuvir = Math.Max(naoConsigoOuvir, ExtrairInt(resumoEl, "naoConsigoOuvir"));
            }
        }
        catch
        {
            // Payload inválido não impede retorno parcial via Sessao_Leitura.
        }
    }

    private async Task PersistirRelatorioCriancaAsync(System.Data.Common.DbConnection conn, int criancaId, object resumoMinigames)
    {
        var resumo = ExtrairResumoMinigames(resumoMinigames);
        if (resumo.TentativasReprovadas == 0 &&
            resumo.AcertosMG == 0 &&
            resumo.ErrosMG == 0 &&
            resumo.NaoConsigoOuvir == 0 &&
            resumo.MinigamesJogados == 0)
        {
            return;
        }

        try
        {
            await conn.ExecuteAsync(
                """
                MERGE Relatorio_Crianca AS alvo
                USING (SELECT @CriancaId AS Id_Crianca) AS origem
                ON alvo.Id_Crianca = origem.Id_Crianca
                WHEN MATCHED THEN
                    UPDATE SET
                        TentativasReprovadas = CASE WHEN @TentativasReprovadas > alvo.TentativasReprovadas THEN @TentativasReprovadas ELSE alvo.TentativasReprovadas END,
                        AcertosMG = CASE WHEN @AcertosMG > alvo.AcertosMG THEN @AcertosMG ELSE alvo.AcertosMG END,
                        ErrosMG = CASE WHEN @ErrosMG > alvo.ErrosMG THEN @ErrosMG ELSE alvo.ErrosMG END,
                        NaoConsigoOuvir = CASE WHEN @NaoConsigoOuvir > alvo.NaoConsigoOuvir THEN @NaoConsigoOuvir ELSE alvo.NaoConsigoOuvir END,
                        UpdatedAt = SYSUTCDATETIME()
                WHEN NOT MATCHED THEN
                    INSERT (Id_Crianca, TentativasReprovadas, AcertosMG, ErrosMG, NaoConsigoOuvir, UpdatedAt)
                    VALUES (@CriancaId, @TentativasReprovadas, @AcertosMG, @ErrosMG, @NaoConsigoOuvir, SYSUTCDATETIME());
                """,
                new
                {
                    CriancaId = criancaId,
                    resumo.TentativasReprovadas,
                    resumo.AcertosMG,
                    resumo.ErrosMG,
                    resumo.NaoConsigoOuvir
                });
        }
        catch
        {
            // Tabela pode não existir em bancos antigos — payload JSON ainda é salvo.
        }
    }

    private async Task<(int TentativasReprovadas, int AcertosMG, int ErrosMG, int NaoConsigoOuvir, DateTime UpdatedAt)?> CarregarRelatorioCriancaAsync(
        System.Data.Common.DbConnection conn,
        int criancaId)
    {
        try
        {
            return await conn.QueryFirstOrDefaultAsync<(int TentativasReprovadas, int AcertosMG, int ErrosMG, int NaoConsigoOuvir, DateTime UpdatedAt)?>(
                """
                SELECT TentativasReprovadas, AcertosMG, ErrosMG, NaoConsigoOuvir, UpdatedAt
                FROM Relatorio_Crianca
                WHERE Id_Crianca = @CriancaId
                """,
                new { CriancaId = criancaId });
        }
        catch
        {
            return null;
        }
    }

    private static (int MinigamesJogados, int TentativasReprovadas, int AcertosMG, int ErrosMG, int NaoConsigoOuvir) ExtrairResumoMinigames(object resumoMinigames)
    {
        try
        {
            var json = JsonSerializer.Serialize(resumoMinigames);
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind != JsonValueKind.Object)
            {
                return (0, 0, 0, 0, 0);
            }

            var root = doc.RootElement;
            return (
                ExtrairInt(root, "minigamesJogados"),
                ExtrairInt(root, "tentativasReprovadas"),
                ExtrairInt(root, "acertosMG"),
                ExtrairInt(root, "errosMG"),
                ExtrairInt(root, "naoConsigoOuvir"));
        }
        catch
        {
            return (0, 0, 0, 0, 0);
        }
    }

    private async Task PersistirAtividadeDiariaAsync(System.Data.Common.DbConnection conn, int criancaId, object progressoHistorias)
    {
        var atividade = AgruparAtividadeDiaria(ExtrairHistoriasLidas(progressoHistorias));
        if (atividade.Count == 0)
        {
            return;
        }

        foreach (var (data, quantidade) in atividade)
        {
            await conn.ExecuteAsync(
                """
                MERGE Atividade_Diaria AS alvo
                USING (SELECT @CriancaId AS Id_Crianca, @Data AS Data, @Quantidade AS HistoriasConcluidas) AS origem
                ON alvo.Id_Crianca = origem.Id_Crianca AND alvo.Data = origem.Data
                WHEN MATCHED AND origem.HistoriasConcluidas > alvo.HistoriasConcluidas THEN
                    UPDATE SET HistoriasConcluidas = origem.HistoriasConcluidas
                WHEN NOT MATCHED THEN
                    INSERT (Id_Crianca, Data, HistoriasConcluidas)
                    VALUES (origem.Id_Crianca, origem.Data, origem.HistoriasConcluidas);
                """,
                new
                {
                    CriancaId = criancaId,
                    Data = data,
                    Quantidade = quantidade
                });
        }
    }

    private async Task<List<AtividadeDiariaDto>> CarregarAtividadeDiariaAsync(
        System.Data.Common.DbConnection conn,
        int criancaId,
        List<HistoriaProgressoDto> historiasLidas)
    {
        var mapa = new Dictionary<string, int>(StringComparer.Ordinal);

        try
        {
            var linhas = await conn.QueryAsync<(DateTime Data, int HistoriasConcluidas)>(
                """
                SELECT Data, HistoriasConcluidas
                FROM Atividade_Diaria
                WHERE Id_Crianca = @CriancaId
                ORDER BY Data DESC
                """,
                new { CriancaId = criancaId });

            foreach (var linha in linhas)
            {
                var chave = linha.Data.ToString("yyyy-MM-dd");
                mapa[chave] = Math.Max(mapa.GetValueOrDefault(chave), linha.HistoriasConcluidas);
            }
        }
        catch
        {
            // Tabela pode não existir em bancos antigos — usa fallback das histórias lidas.
        }

        foreach (var (data, quantidade) in AgruparAtividadeDiaria(historiasLidas))
        {
            mapa[data] = Math.Max(mapa.GetValueOrDefault(data), quantidade);
        }

        return mapa
            .OrderByDescending(kv => kv.Key)
            .Select(kv => new AtividadeDiariaDto(kv.Key, kv.Value))
            .ToList();
    }

    private static Dictionary<string, int> AgruparAtividadeDiaria(IEnumerable<HistoriaProgressoDto> historias)
    {
        var mapa = new Dictionary<string, int>(StringComparer.Ordinal);
        foreach (var historia in historias)
        {
            if (historia.Estrelas <= 0)
            {
                continue;
            }

            var dataIso = NormalizarDataIso(historia.DataIso, historia.Data);
            if (dataIso is null)
            {
                continue;
            }

            mapa[dataIso] = mapa.GetValueOrDefault(dataIso) + 1;
        }

        return mapa;
    }

    private static string? NormalizarDataIso(string? dataIso, string? data)
    {
        if (!string.IsNullOrWhiteSpace(dataIso) &&
            DateTime.TryParseExact(dataIso, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out _))
        {
            return dataIso;
        }

        if (string.IsNullOrWhiteSpace(data))
        {
            return null;
        }

        var partes = data.Split('/');
        if (partes.Length == 3 &&
            int.TryParse(partes[0], out var dia) &&
            int.TryParse(partes[1], out var mes) &&
            int.TryParse(partes[2], out var ano))
        {
            return new DateTime(ano, mes, dia).ToString("yyyy-MM-dd");
        }

        return null;
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
                var dataIso = item.TryGetProperty("dataIso", out var dataIsoEl) ? dataIsoEl.GetString()
                    : item.TryGetProperty("DataIso", out dataIsoEl) ? dataIsoEl.GetString() : null;

                resultado.Add(new HistoriaProgressoDto(id, estrelas, data, dataIso));
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
