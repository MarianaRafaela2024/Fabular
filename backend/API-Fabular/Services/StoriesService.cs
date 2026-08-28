using System.Data;
using System.Text.Json;
using API_Fabular.Contracts;
using API_Fabular.Infra;
using Dapper;

namespace API_Fabular.Services;

public class StoriesService
{
    private readonly DbConnectionFactory _db;
    private readonly StoryGeneratorService _generator;

    public StoriesService(DbConnectionFactory db, StoryGeneratorService generator)
    {
        _db = db;
        _generator = generator;
    }

    // DEPRECATED (etapa 3): o cliente gera com Groq e persiste via SaveAsync.
    [Obsolete("Geração ocorre no JS (Groq). Persistência: POST /api/v1/stories/save.")]
    public async Task<ApplicationResult<StoryDetailDto>> GenerateAsync(StoryGenerateRequest request)
    {
        if (!request.CriancaId.HasValue || request.CriancaId.Value <= 0)
            return ApplicationResult<StoryDetailDto>.BadRequest("Informe o perfil da criança para gerar a história.");

        await using var conn = _db.Create();

        if (request.ResponsavelId.HasValue && request.ResponsavelId.Value > 0)
        {
            var belongs = await CriancaBelongsToResponsavelAsync(conn, request.CriancaId.Value, request.ResponsavelId.Value);
            if (!belongs)
                return ApplicationResult<StoryDetailDto>.BadRequest("Criança não vinculada a este responsável.");
        }

        var generated = _generator.Generate(request);
        var id = await PersistStoryAsync(conn, generated, "ia");

        await LinkIaGeracaoAsync(
            conn,
            request.CriancaId.Value,
            id,
            request.PromptCrianca,
            "local-template-v1",
            JsonSerializer.Serialize(new { request.FaixaEtaria, request.GeneroTextual, request.Tema }),
            JsonSerializer.Serialize(generated with { Id = id }));

        return ApplicationResult<StoryDetailDto>.Ok(generated with { Id = id });
    }

    public async Task<ApplicationResult<StoryDetailDto>> SaveAsync(StorySaveRequest request)
    {
        if (request.CriancaId <= 0)
            return ApplicationResult<StoryDetailDto>.BadRequest("Informe o perfil da criança vinculado.");

        if (request.Story is null || string.IsNullOrWhiteSpace(request.Story.Titulo) || string.IsNullOrWhiteSpace(request.Story.Texto))
            return ApplicationResult<StoryDetailDto>.BadRequest("História inválida para salvar.");

        await using var conn = _db.Create();

        if (request.ResponsavelId.HasValue && request.ResponsavelId.Value > 0)
        {
            var belongs = await CriancaBelongsToResponsavelAsync(conn, request.CriancaId, request.ResponsavelId.Value);
            if (!belongs)
                return ApplicationResult<StoryDetailDto>.BadRequest("Criança não vinculada a este responsável.");
        }

        var faixa = Math.Clamp(request.Story.FaixaEtaria, 1, 3);
        var genero = GeneroCatalog.NormalizarSlug(request.Story.Genero) ?? GeneroCatalog.Narrativo;
        var minigames = request.Story.Minigames ?? new List<MinigameDto>();

        var detail = new StoryDetailDto(
            0,
            request.Story.Titulo.Trim(),
            genero,
            faixa,
            request.Story.Duracao,
            request.Story.Emoji,
            request.Story.Cena,
            request.Story.Texto.Trim(),
            request.Story.PalavrasChave ?? new List<string>(),
            minigames);

        var id = await PersistStoryAsync(conn, detail, "ia");
        var payloadJson = JsonSerializer.Serialize(detail with { Id = id });
        var modelo = string.IsNullOrWhiteSpace(request.Modelo) ? "groq" : request.Modelo.Trim();

        await LinkIaGeracaoAsync(
            conn,
            request.CriancaId,
            id,
            request.PromptCrianca,
            modelo,
            JsonSerializer.Serialize(new { detail.FaixaEtaria, detail.Genero }),
            payloadJson);

        return ApplicationResult<StoryDetailDto>.Ok(detail with { Id = id });
    }

    public async Task<ApplicationResult<IEnumerable<StorySummaryDto>>> ListAsync(int? faixaEtaria, string? genero, int? criancaId, int? responsavelId)
    {
        await using var conn = _db.Create();

        // Quando criancaId é fornecido: retorna apenas histórias geradas para aquela criança.
        // Quando responsavelId é fornecido sem criancaId: retorna histórias de todas as crianças do responsável.
        // Retorna histórias base de origem 'manual' (do banco de dados MySQL)
        // juntamente com as histórias geradas pela IA vinculadas à criança/responsável.
        var sql = """
                  SELECT DISTINCT h.Id, h.Titulo,
                         COALESCE(gen.Slug, h.Genero) AS Genero,
                         CAST(h.FaixaEtaria AS INT) AS FaixaEtaria,
                         h.Duracao, h.Emoji, h.Cena,
                         CAST(g.Id_Crianca AS INT) AS CriancaId
                  FROM Historia h
                  LEFT JOIN IA_Geracao g ON g.Id_Historia = h.Id
                  LEFT JOIN Genero gen ON gen.Id = h.Id_Genero
                  WHERE (@Faixa IS NULL OR h.FaixaEtaria = @Faixa)
                    AND (
                      @Genero IS NULL
                      OR (@IdGenero IS NOT NULL AND (
                            h.Id_Genero = @IdGenero
                            OR (
                              h.Id_Genero IS NULL
                              AND (
                                LOWER(h.Genero COLLATE Latin1_General_CI_AI) = @Genero
                                OR (@Genero = N'instrucional' AND LOWER(h.Genero COLLATE Latin1_General_CI_AI) = N'cotidiano')
                              )
                            )
                          ))
                      OR (@IdGenero IS NULL AND (
                            LOWER(h.Genero COLLATE Latin1_General_CI_AI) = @Genero
                            OR (@Genero = N'instrucional' AND LOWER(h.Genero COLLATE Latin1_General_CI_AI) = N'cotidiano')
                          ))
                    )
                    AND (
                      h.Origem = 'manual'
                      OR (@CriancaId IS NOT NULL AND g.Id_Crianca = @CriancaId)
                      OR (
                        @CriancaId IS NULL
                        AND @ResponsavelId IS NOT NULL
                        AND EXISTS (
                          SELECT 1 FROM Responsavel_Crianca rc
                          WHERE rc.Id_Responsavel = @ResponsavelId AND rc.Id_Crianca = g.Id_Crianca
                        )
                      )
                    )
                  ORDER BY h.Id DESC
                  """;

        var slug = GeneroCatalog.NormalizarSlug(genero);
        int? idGenero = null;
        if (slug is not null)
        {
            idGenero = await conn.QueryFirstOrDefaultAsync<int?>(
                "SELECT Id FROM Genero WHERE Slug = @Slug",
                new { Slug = slug });
        }

        var result = await conn.QueryAsync<StorySummaryDto>(sql, new
        {
            Faixa = faixaEtaria,
            Genero = slug,
            IdGenero = idGenero,
            CriancaId = criancaId,
            ResponsavelId = responsavelId
        });
        return ApplicationResult<IEnumerable<StorySummaryDto>>.Ok(result);
    }

    public async Task<ApplicationResult<StoryDetailDto>> GetByIdAsync(int id, int? criancaId)
    {
        await using var conn = _db.Create();
        if (!await ChildCanAccessStoryAsync(conn, id, criancaId))
        {
            return ApplicationResult<StoryDetailDto>.NotFound("História não encontrada.");
        }

        var row = await conn.QueryFirstOrDefaultAsync<(int Id, string Titulo, string Genero, int FaixaEtaria, string Duracao, string Emoji, string Cena, string TextoHtml, string PalavrasChaveJson, string PayloadJson)>(
            """
            SELECT h.Id, h.Titulo, COALESCE(gen.Slug, h.Genero) AS Genero, h.FaixaEtaria, h.Duracao, h.Emoji, h.Cena,
                   h.TextoHtml, h.PalavrasChaveJson, h.PayloadJson
            FROM Historia h
            LEFT JOIN Genero gen ON gen.Id = h.Id_Genero
            WHERE h.Id = @Id
            """,
            new { Id = id });

        if (row.Id == 0)
        {
            return ApplicationResult<StoryDetailDto>.NotFound("História não encontrada.");
        }

        var palavrasTabela = await LoadPalavrasChaveAsync(conn, id);

        if (!string.IsNullOrWhiteSpace(row.PayloadJson))
        {
            try
            {
                var fromPayload = JsonSerializer.Deserialize<StoryDetailDto>(row.PayloadJson);
                if (fromPayload is not null && !string.IsNullOrWhiteSpace(fromPayload.Texto))
                {
                    var palavras = PalavrasChaveNormalizer.PreferirTabela(palavrasTabela, fromPayload.PalavrasChave);
                    return ApplicationResult<StoryDetailDto>.Ok(fromPayload with { Id = row.Id, PalavrasChave = palavras });
                }
            }
            catch
            {
                // Fallback para os campos individuais caso PayloadJson use esquema diferente
            }
        }

        List<string>? wordsJson = null;
        try
        {
            if (!string.IsNullOrWhiteSpace(row.PalavrasChaveJson))
            {
                wordsJson = JsonSerializer.Deserialize<List<string>>(row.PalavrasChaveJson);
            }
        }
        catch
        {
            // JSON inválido permanece na coluna; a tabela (se houver) prevalece.
        }

        var words = PalavrasChaveNormalizer.PreferirTabela(palavrasTabela, wordsJson);
        var minigames = await LoadMinigamesAsync(conn, id);
        return ApplicationResult<StoryDetailDto>.Ok(new StoryDetailDto(
            row.Id, row.Titulo, row.Genero, row.FaixaEtaria, row.Duracao, row.Emoji, row.Cena, row.TextoHtml, words, minigames));
    }

    private static async Task<int> PersistStoryAsync(IDbConnection conn, StoryDetailDto story, string origem)
    {
        var (generoSlug, idGenero) = await GeneroCatalog.ResolverAsync(conn, story.Genero);
        var generoTexto = generoSlug ?? story.Genero ?? GeneroCatalog.Narrativo;
        var wordsJson = JsonSerializer.Serialize(story.PalavrasChave);
        var payloadJson = JsonSerializer.Serialize(story with { Genero = generoTexto });

        var id = await conn.QuerySingleAsync<int>(
            """
            INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson, Id_Genero)
            OUTPUT INSERTED.Id
            VALUES (@Origem, @Titulo, @Genero, @FaixaEtaria, @Duracao, @Emoji, @Cena, @TextoHtml, @PalavrasChaveJson, @PayloadJson, @IdGenero)
            """,
            new
            {
                Origem = origem,
                story.Titulo,
                Genero = generoTexto,
                story.FaixaEtaria,
                story.Duracao,
                story.Emoji,
                story.Cena,
                TextoHtml = story.Texto,
                PalavrasChaveJson = wordsJson,
                PayloadJson = payloadJson,
                IdGenero = idGenero
            });

        await SavePalavrasChaveAsync(conn, id, story.PalavrasChave);
        await SaveMinigamesAsync(conn, id, story.Minigames);
        return id;
    }

    private static async Task SavePalavrasChaveAsync(IDbConnection conn, int historiaId, List<string>? palavras)
    {
        foreach (var (ordem, palavra) in PalavrasChaveNormalizer.DeLista(palavras))
        {
            await conn.ExecuteAsync(
                """
                INSERT INTO Historia_PalavraChave (Id_Historia, Palavra, Ordem)
                VALUES (@Id_Historia, @Palavra, @Ordem)
                """,
                new { Id_Historia = historiaId, Palavra = palavra, Ordem = ordem });
        }
    }

    private static async Task<List<string>> LoadPalavrasChaveAsync(IDbConnection conn, int historiaId)
    {
        var rows = await conn.QueryAsync<string>(
            """
            SELECT Palavra
            FROM Historia_PalavraChave
            WHERE Id_Historia = @Id
            ORDER BY Ordem
            """,
            new { Id = historiaId });

        return rows.AsList();
    }

    private static async Task SaveMinigamesAsync(IDbConnection conn, int historiaId, List<MinigameDto> minigames)
    {
        if (minigames.Count == 0) return;

        var ordem = 1;
        foreach (var mg in minigames)
        {
            var dados = new Dictionary<string, object?>
            {
                ["pergunta"] = mg.Pergunta
            };
            if (mg.Dados is JsonElement el)
            {
                foreach (var prop in el.EnumerateObject())
                {
                    dados[prop.Name] = JsonSerializer.Deserialize<object>(prop.Value.GetRawText());
                }
            }
            else if (mg.Dados is not null)
            {
                var extra = JsonSerializer.SerializeToElement(mg.Dados);
                foreach (var prop in extra.EnumerateObject())
                {
                    dados[prop.Name] = JsonSerializer.Deserialize<object>(prop.Value.GetRawText());
                }
            }

            await conn.ExecuteAsync(
                """
                INSERT INTO Historia_Minigame (Id_Historia, Ordem, Tipo, DadosJson)
                VALUES (@Id_Historia, @Ordem, @Tipo, @DadosJson)
                """,
                new
                {
                    Id_Historia = historiaId,
                    Ordem = ordem,
                    mg.Tipo,
                    DadosJson = JsonSerializer.Serialize(dados)
                });
            ordem++;
        }
    }

    private static async Task<List<MinigameDto>> LoadMinigamesAsync(IDbConnection conn, int historiaId)
    {
        var rows = await conn.QueryAsync<(string Tipo, string DadosJson)>(
            """
            SELECT Tipo, DadosJson
            FROM Historia_Minigame
            WHERE Id_Historia = @Id
            ORDER BY Ordem
            """,
            new { Id = historiaId });

        var list = new List<MinigameDto>();
        foreach (var row in rows)
        {
            var pergunta = "";
            object dados = new { };
            if (!string.IsNullOrWhiteSpace(row.DadosJson))
            {
                using var doc = JsonDocument.Parse(row.DadosJson);
                if (doc.RootElement.TryGetProperty("pergunta", out var p))
                {
                    pergunta = p.GetString() ?? "";
                }

                var clone = JsonSerializer.Deserialize<Dictionary<string, object?>>(row.DadosJson) ?? new Dictionary<string, object?>();
                clone.Remove("pergunta");
                dados = clone;
            }

            list.Add(new MinigameDto(row.Tipo, pergunta, dados));
        }

        return list;
    }

    private static async Task LinkIaGeracaoAsync(
        IDbConnection conn,
        int criancaId,
        int historiaId,
        string prompt,
        string modelo,
        string contextoJson,
        string payloadJson)
    {
        await conn.ExecuteAsync(
            """
            INSERT INTO IA_Geracao (Id_Crianca, Id_Historia, PromptCrianca, ContextoJson, Modelo, PayloadRespostaJson)
            VALUES (@Id_Crianca, @Id_Historia, @Prompt, @Contexto, @Modelo, @Payload)
            """,
            new
            {
                Id_Crianca = criancaId,
                Id_Historia = historiaId,
                Prompt = prompt,
                Contexto = contextoJson,
                Modelo = modelo,
                Payload = payloadJson
            });
    }

    private static async Task<bool> CriancaBelongsToResponsavelAsync(IDbConnection conn, int criancaId, int responsavelId)
    {
        return await conn.ExecuteScalarAsync<bool>(
            """
            SELECT CASE WHEN EXISTS (
              SELECT 1 FROM Responsavel_Crianca
              WHERE Id_Responsavel = @ResponsavelId AND Id_Crianca = @CriancaId
            ) THEN 1 ELSE 0 END
            """,
            new { ResponsavelId = responsavelId, CriancaId = criancaId });
    }

    private static async Task<bool> ChildCanAccessStoryAsync(IDbConnection conn, int historiaId, int? criancaId)
    {
        var origem = await conn.QuerySingleOrDefaultAsync<string?>(
            "SELECT Origem FROM Historia WHERE Id = @Id",
            new { Id = historiaId });

        if (string.IsNullOrWhiteSpace(origem))
        {
            return false;
        }

        if (origem == "manual")
        {
            return true;
        }

        if (!criancaId.HasValue || criancaId.Value <= 0)
        {
            return false;
        }

        return await conn.ExecuteScalarAsync<bool>(
            """
            SELECT CASE WHEN EXISTS (
              SELECT 1 FROM IA_Geracao
              WHERE Id_Historia = @Id AND Id_Crianca = @CriancaId
            ) THEN 1 ELSE 0 END
            """,
            new { Id = historiaId, CriancaId = criancaId.Value });
    }
}
