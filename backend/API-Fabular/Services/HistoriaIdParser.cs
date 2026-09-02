namespace API_Fabular.Services;

/// <summary>
/// Converte ids de história do cliente (n1, api-3, 3) para Historia.Id.
/// </summary>
public static class HistoriaIdParser
{
    private static readonly Dictionary<string, int> IdsLegados = new(StringComparer.OrdinalIgnoreCase)
    {
        ["n1"] = 1,
        ["n2"] = 2,
        ["n3"] = 3,
        ["p1"] = 4,
        ["p2"] = 5,
        ["i1"] = 6,
        ["i2"] = 7,
        ["d1"] = 8,
        ["d2"] = 9,
        ["inf1"] = 10,
        ["inf2"] = 11
    };

    public static bool TryParse(string? storyId, out int historiaId)
    {
        historiaId = 0;
        if (string.IsNullOrWhiteSpace(storyId))
        {
            return false;
        }

        if (IdsLegados.TryGetValue(storyId, out historiaId))
        {
            return true;
        }

        if (storyId.StartsWith("api-", StringComparison.OrdinalIgnoreCase))
        {
            return int.TryParse(storyId.AsSpan(4), out historiaId) && historiaId > 0;
        }

        return int.TryParse(storyId, out historiaId) && historiaId > 0;
    }

    public static string ToApiId(int historiaId) => $"api-{historiaId}";

    public static string CanonicalKey(string? storyId)
    {
        if (TryParse(storyId, out var id))
        {
            return ToApiId(id);
        }

        return string.IsNullOrWhiteSpace(storyId) ? string.Empty : storyId.Trim();
    }
}
