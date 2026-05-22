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

    public async Task<ApplicationResult<StoryDetailDto>> GenerateAsync(StoryGenerateRequest request)
    {
        var generated = _generator.Generate(request);
        var wordsJson = JsonSerializer.Serialize(generated.PalavrasChave);
        var payloadJson = JsonSerializer.Serialize(generated);

        await using var conn = _db.Create();
        var id = await conn.QuerySingleAsync<int>(
            """
            INSERT INTO Historia (Origem, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson)
            OUTPUT INSERTED.Id
            VALUES ('ia', @Titulo, @Genero, @FaixaEtaria, @Duracao, @Emoji, @Cena, @TextoHtml, @PalavrasChaveJson, @PayloadJson)
            """,
            new
            {
                generated.Titulo,
                generated.Genero,
                generated.FaixaEtaria,
                generated.Duracao,
                generated.Emoji,
                generated.Cena,
                TextoHtml = generated.Texto,
                PalavrasChaveJson = wordsJson,
                PayloadJson = payloadJson
            });

        if (request.CriancaId.HasValue && request.CriancaId.Value > 0)
        {
            await conn.ExecuteAsync(
                """
                INSERT INTO IA_Geracao (Id_Crianca, Id_Historia, PromptCrianca, ContextoJson, Modelo, PayloadRespostaJson)
                VALUES (@Id_Crianca, @Id_Historia, @Prompt, @Contexto, 'local-template-v1', @Payload)
                """,
                new
                {
                    Id_Crianca = request.CriancaId.Value,
                    Id_Historia = id,
                    Prompt = request.PromptCrianca,
                    Contexto = JsonSerializer.Serialize(new { request.FaixaEtaria, request.GeneroTextual, request.Tema }),
                    Payload = payloadJson
                });
        }

        return ApplicationResult<StoryDetailDto>.Ok(generated with { Id = id });
    }

    public async Task<ApplicationResult<IEnumerable<StorySummaryDto>>> ListAsync(int? faixaEtaria, string? genero)
    {
        await using var conn = _db.Create();
        var sql = """
                  SELECT Id, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena
                  FROM Historia
                  WHERE (@Faixa IS NULL OR FaixaEtaria = @Faixa)
                    AND (@Genero IS NULL OR Genero = @Genero)
                  ORDER BY Id DESC
                  """;

        var result = await conn.QueryAsync<StorySummaryDto>(sql, new
        {
            Faixa = faixaEtaria,
            Genero = string.IsNullOrWhiteSpace(genero) ? null : genero.ToLowerInvariant()
        });
        return ApplicationResult<IEnumerable<StorySummaryDto>>.Ok(result);
    }

    public async Task<ApplicationResult<StoryDetailDto>> GetByIdAsync(int id)
    {
        await using var conn = _db.Create();
        var row = await conn.QueryFirstOrDefaultAsync<(int Id, string Titulo, string Genero, int FaixaEtaria, string Duracao, string Emoji, string Cena, string TextoHtml, string PalavrasChaveJson, string PayloadJson)>(
            "SELECT Id, Titulo, Genero, FaixaEtaria, Duracao, Emoji, Cena, TextoHtml, PalavrasChaveJson, PayloadJson FROM Historia WHERE Id = @Id",
            new { Id = id });

        if (row.Id == 0)
        {
            return ApplicationResult<StoryDetailDto>.NotFound("História não encontrada.");
        }

        if (!string.IsNullOrWhiteSpace(row.PayloadJson))
        {
            var fromPayload = JsonSerializer.Deserialize<StoryDetailDto>(row.PayloadJson);
            if (fromPayload is not null)
            {
                return ApplicationResult<StoryDetailDto>.Ok(fromPayload with { Id = row.Id });
            }
        }

        var words = string.IsNullOrWhiteSpace(row.PalavrasChaveJson)
            ? new List<string>()
            : JsonSerializer.Deserialize<List<string>>(row.PalavrasChaveJson) ?? new List<string>();

        return ApplicationResult<StoryDetailDto>.Ok(new StoryDetailDto(
            row.Id, row.Titulo, row.Genero, row.FaixaEtaria, row.Duracao, row.Emoji, row.Cena, row.TextoHtml, words, new List<MinigameDto>()));
    }
}
