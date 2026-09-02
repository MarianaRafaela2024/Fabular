using API_Fabular.Services;

namespace API_Fabular.Tests;

public class HistoriaIdParserTests
{
    [Theory]
    [InlineData("n1", 1)]
    [InlineData("api-3", 3)]
    [InlineData("API-3", 3)]
    [InlineData("3", 3)]
    [InlineData("inf2", 11)]
    public void TryParse_ids_conhecidos(string entrada, int esperado)
    {
        Assert.True(HistoriaIdParser.TryParse(entrada, out var id));
        Assert.Equal(esperado, id);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("api-")]
    [InlineData("0")]
    [InlineData("xyz")]
    public void TryParse_ids_invalidos(string? entrada)
    {
        Assert.False(HistoriaIdParser.TryParse(entrada, out _));
    }

    [Fact]
    public void CanonicalKey_n1_api1_e_1_sao_a_mesma_chave()
    {
        Assert.Equal("api-1", HistoriaIdParser.CanonicalKey("n1"));
        Assert.Equal("api-1", HistoriaIdParser.CanonicalKey("api-1"));
        Assert.Equal("api-1", HistoriaIdParser.CanonicalKey("1"));
        Assert.Equal(HistoriaIdParser.CanonicalKey("n1"), HistoriaIdParser.CanonicalKey("api-1"));
    }
}
