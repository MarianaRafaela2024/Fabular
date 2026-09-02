using API_Fabular.Services;

namespace API_Fabular.Tests;

public class GeneroCatalogTests
{
    [Theory]
    [InlineData(null, null)]
    [InlineData("", null)]
    [InlineData("   ", null)]
    [InlineData("narrativo", "narrativo")]
    [InlineData("Narrativo", "narrativo")]
    [InlineData("NARRATIVO", "narrativo")]
    [InlineData("poetico", "poetico")]
    [InlineData("Poético", "poetico")]
    [InlineData("POÉTICO", "poetico")]
    [InlineData("Poetico", "poetico")]
    [InlineData("instrucional", "instrucional")]
    [InlineData("Instrucional", "instrucional")]
    [InlineData("Cotidiano", "instrucional")]
    [InlineData("cotidiano", "instrucional")]
    [InlineData("descritivo", "descritivo")]
    [InlineData("informativo", "informativo")]
    [InlineData("  Narrativo  ", "narrativo")]
    public void NormalizarSlug_valores_conhecidos(string? entrada, string? esperado)
    {
        Assert.Equal(esperado, GeneroCatalog.NormalizarSlug(entrada));
    }

    [Fact]
    public void NormalizarSlug_valor_desconhecido_permanece_normalizado()
    {
        Assert.Equal("aventura", GeneroCatalog.NormalizarSlug("Aventura"));
    }

    [Theory]
    [InlineData("narrativo")]
    [InlineData("poetico")]
    [InlineData("instrucional")]
    [InlineData("descritivo")]
    [InlineData("informativo")]
    public void NormalizarSlug_slugs_canonicos_sao_estaveis(string slug)
    {
        Assert.Equal(slug, GeneroCatalog.NormalizarSlug(slug));
    }
}
