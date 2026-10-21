namespace API_Fabular.Services;

/// <summary>
/// Regras alinhadas ao backfill OPENJSON da etapa 11 (trim, máx. 80, ordem 1-based pelo índice).
/// </summary>
public static class PalavrasChaveNormalizer
{
    public const int MaxLength = 80;
    public const int MaxCount = 255;

    public static List<(byte Ordem, string Palavra)> DeLista(IEnumerable<string>? palavras)
    {
        var result = new List<(byte Ordem, string Palavra)>();
        if (palavras is null)
        {
            return result;
        }

        var indice = 0;
        foreach (var raw in palavras)
        {
            if (indice >= MaxCount)
            {
                break;
            }

            indice++;
            var palavra = (raw ?? string.Empty).Trim();
            if (palavra.Length == 0)
            {
                continue;
            }

            if (palavra.Length > MaxLength)
            {
                palavra = palavra[..MaxLength];
            }

            result.Add(((byte)indice, palavra));
        }

        return result;
    }

    public static List<string> PreferirTabela(IReadOnlyList<string> daTabela, IReadOnlyList<string>? fallback)
    {
        if (daTabela.Count > 0)
        {
            return daTabela.ToList();
        }

        return fallback?.ToList() ?? new List<string>();
    }
}
