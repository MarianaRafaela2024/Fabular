using System.Text.Json;

namespace API_Fabular.Services;

public sealed record HistoriaFaseDto(byte Ordem, string TextoHtml, string? Cena);

/// <summary>
/// Regras alinhadas ao backfill OPENJSON da etapa 12 (fases[] em PayloadJson,
/// fallback em TextoHtml, cena máx. 40, ordem 1-based pelo índice).
/// </summary>
public static class HistoriaFaseAssembler
{
    public const int MaxCenaLength = 40;
    public const int MaxCount = 255;
    public const string SeparadorConcat = " ";

    public static string Concatenar(IEnumerable<HistoriaFaseDto>? fases, string? fallbackTextoHtml = null)
    {
        if (fases is not null)
        {
            var partes = fases
                .OrderBy(f => f.Ordem)
                .Select(f => f.TextoHtml)
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .ToList();
            if (partes.Count > 0)
            {
                return string.Join(SeparadorConcat, partes);
            }
        }

        return fallbackTextoHtml ?? string.Empty;
    }

    public static List<HistoriaFaseDto> DeTextoUnico(string? textoHtml, string? cena)
    {
        var texto = (textoHtml ?? string.Empty).Trim();
        if (texto.Length == 0)
        {
            return new List<HistoriaFaseDto>();
        }

        return new List<HistoriaFaseDto> { new(1, texto, TruncarCena(cena)) };
    }

    /// <summary>
    /// Espelha o backfill SQL. JSON inválido não extrai fases (skip do blob);
    /// se não houver fases utilizáveis, uma fase com <paramref name="textoHtmlFallback"/>.
    /// </summary>
    public static List<HistoriaFaseDto> DePayloadJson(string? payloadJson, string? textoHtmlFallback, string? cenaFallback)
    {
        if (!string.IsNullOrWhiteSpace(payloadJson))
        {
            JsonDocument doc;
            try
            {
                doc = JsonDocument.Parse(payloadJson);
            }
            catch (JsonException)
            {
                return DeTextoUnico(textoHtmlFallback, cenaFallback);
            }

            using (doc)
            {
                if (doc.RootElement.ValueKind == JsonValueKind.Object
                    && TryGetPropertyIgnoreCase(doc.RootElement, "fases", out var fasesEl)
                    && fasesEl.ValueKind == JsonValueKind.Array)
                {
                    var extraidas = ExtrairFasesDoArray(fasesEl, cenaFallback);
                    if (extraidas.Count > 0)
                    {
                        return extraidas;
                    }
                }
            }
        }

        return DeTextoUnico(textoHtmlFallback, cenaFallback);
    }

    public static string? TruncarCena(string? cena)
    {
        if (string.IsNullOrWhiteSpace(cena))
        {
            return null;
        }

        var t = cena.Trim();
        return t.Length <= MaxCenaLength ? t : t[..MaxCenaLength];
    }

    private static List<HistoriaFaseDto> ExtrairFasesDoArray(JsonElement array, string? cenaFallback)
    {
        var result = new List<HistoriaFaseDto>();
        var indice = 0;
        foreach (var item in array.EnumerateArray())
        {
            if (indice >= MaxCount)
            {
                break;
            }

            indice++;
            var texto = TextoDaFase(item);
            if (string.IsNullOrWhiteSpace(texto))
            {
                continue;
            }

            var cena = CenaDaFase(item) ?? cenaFallback;
            result.Add(new HistoriaFaseDto((byte)indice, texto.Trim(), TruncarCena(cena)));
        }

        return result;
    }

    private static string? TextoDaFase(JsonElement item)
    {
        if (item.ValueKind == JsonValueKind.String)
        {
            return item.GetString();
        }

        if (item.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        if (TryGetPropertyIgnoreCase(item, "texto", out var textoEl) && textoEl.ValueKind == JsonValueKind.String)
        {
            return textoEl.GetString();
        }

        if (TryGetPropertyIgnoreCase(item, "textoHtml", out var htmlEl) && htmlEl.ValueKind == JsonValueKind.String)
        {
            return htmlEl.GetString();
        }

        return null;
    }

    private static string? CenaDaFase(JsonElement item)
    {
        if (item.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        if (TryGetPropertyIgnoreCase(item, "cena", out var cenaEl) && cenaEl.ValueKind == JsonValueKind.String)
        {
            return cenaEl.GetString();
        }

        return null;
    }

    private static bool TryGetPropertyIgnoreCase(JsonElement obj, string name, out JsonElement value)
    {
        foreach (var prop in obj.EnumerateObject())
        {
            if (prop.Name.Equals(name, StringComparison.OrdinalIgnoreCase))
            {
                value = prop.Value;
                return true;
            }
        }

        value = default;
        return false;
    }
}
