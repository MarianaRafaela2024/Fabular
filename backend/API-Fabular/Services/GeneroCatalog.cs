using System.Data;
using System.Globalization;
using System.Text;
using Dapper;

namespace API_Fabular.Services;

/// <summary>
/// Normaliza o gênero textual para o slug canônico usado no filtro e (etapa 5+) no catálogo.
/// </summary>
public static class GeneroCatalog
{
    public const string Narrativo = "narrativo";
    public const string Poetico = "poetico";
    public const string Instrucional = "instrucional";
    public const string Descritivo = "descritivo";
    public const string Informativo = "informativo";

    /// <summary>
    /// Converte o valor livre do banco/API para slug: minúsculas, sem acento.
    /// Alias legado: cotidiano → instrucional.
    /// String vazia vira null. Valor desconhecido permanece normalizado (não é descartado).
    /// </summary>
    public static string? NormalizarSlug(string? genero)
    {
        if (string.IsNullOrWhiteSpace(genero))
        {
            return null;
        }

        var slug = RemoverAcentos(genero.Trim()).ToLowerInvariant();
        if (slug == "cotidiano")
        {
            return Instrucional;
        }

        return slug;
    }

    /// <summary>
    /// Resolve slug canônico e Id do catálogo. Id fica null se o slug não existir em Genero
    /// (órfão: ainda gravamos o VARCHAR).
    /// </summary>
    public static async Task<(string? Slug, int? Id)> ResolverAsync(
        IDbConnection conn,
        string? genero,
        IDbTransaction? tx = null)
    {
        var slug = NormalizarSlug(genero);
        if (slug is null)
        {
            return (null, null);
        }

        var id = await conn.QueryFirstOrDefaultAsync<int?>(
            "SELECT Id FROM Genero WHERE Slug = @Slug",
            new { Slug = slug },
            tx);
        return (slug, id);
    }

    private static string RemoverAcentos(string valor)
    {
        var formD = valor.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(formD.Length);
        foreach (var c in formD)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }

        return sb.ToString().Normalize(NormalizationForm.FormC);
    }
}
