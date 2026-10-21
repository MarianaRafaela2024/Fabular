using System.Text.Json;
using API_Fabular.Contracts;

namespace API_Fabular.Services;

public readonly record struct StoryColumnSnapshot(
    int Id,
    string Titulo,
    string Genero,
    int FaixaEtaria,
    string? Duracao,
    string? Emoji,
    string? Cena,
    string? TextoHtml);

/// <summary>
/// Monta o detalhe da história a partir das colunas/tabelas; PayloadJson só entra
/// se o texto relacional estiver vazio (ou listas auxiliares vazias).
/// </summary>
public static class StoryDetailAssembler
{
    private static readonly JsonSerializerOptions PayloadOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static StoryDetailDto Montar(
        StoryColumnSnapshot colunas,
        IReadOnlyList<HistoriaFaseDto>? fases,
        IReadOnlyList<string> palavrasTabela,
        string? palavrasChaveJson,
        IReadOnlyList<MinigameDto>? minigamesTabela,
        string? payloadJson)
    {
        var fromPayload = TentarLerPayload(payloadJson);
        var texto = HistoriaFaseAssembler.Concatenar(fases, colunas.TextoHtml);
        if (string.IsNullOrWhiteSpace(texto) && fromPayload is not null && !string.IsNullOrWhiteSpace(fromPayload.Texto))
        {
            texto = fromPayload.Texto;
        }

        var palavrasJson = TentarLerPalavras(palavrasChaveJson);
        var palavras = PalavrasChaveNormalizer.PreferirTabela(palavrasTabela, palavrasJson);
        if (palavras.Count == 0 && fromPayload?.PalavrasChave is { Count: > 0 })
        {
            palavras = fromPayload.PalavrasChave;
        }

        var minigames = minigamesTabela is { Count: > 0 }
            ? minigamesTabela.ToList()
            : new List<MinigameDto>();
        if (minigames.Count == 0 && fromPayload?.Minigames is { Count: > 0 })
        {
            minigames = fromPayload.Minigames;
        }

        return new StoryDetailDto(
            colunas.Id,
            colunas.Titulo,
            colunas.Genero,
            colunas.FaixaEtaria,
            colunas.Duracao,
            colunas.Emoji,
            colunas.Cena,
            texto,
            palavras,
            minigames);
    }

    public static StoryDetailDto? TentarLerPayload(string? payloadJson)
    {
        if (string.IsNullOrWhiteSpace(payloadJson))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<StoryDetailDto>(payloadJson, PayloadOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public static List<string>? TentarLerPalavras(string? palavrasChaveJson)
    {
        if (string.IsNullOrWhiteSpace(palavrasChaveJson))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<List<string>>(palavrasChaveJson, PayloadOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
