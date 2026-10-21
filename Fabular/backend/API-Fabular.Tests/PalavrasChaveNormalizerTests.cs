using API_Fabular.Services;

namespace API_Fabular.Tests;

public class PalavrasChaveNormalizerTests
{
    [Fact]
    public void DeLista_ignora_vazios_e_preserva_ordem_do_indice()
    {
        var pares = PalavrasChaveNormalizer.DeLista(new[] { "casa", "  ", "bola" });

        Assert.Equal(new[] { ((byte)1, "casa"), ((byte)3, "bola") }, pares);
    }

    [Fact]
    public void DeLista_trunca_em_80_e_faz_trim()
    {
        var longa = new string('a', 90);
        var pares = PalavrasChaveNormalizer.DeLista(new[] { "  sol  ", longa });

        Assert.Equal("sol", pares[0].Palavra);
        Assert.Equal(80, pares[1].Palavra.Length);
        Assert.Equal(2, pares.Count);
    }

    [Fact]
    public void PreferirTabela_usa_json_so_quando_tabela_vazia()
    {
        var daTabela = PalavrasChaveNormalizer.PreferirTabela(new[] { "mesa" }, new[] { "json" });
        var soJson = PalavrasChaveNormalizer.PreferirTabela(Array.Empty<string>(), new[] { "json" });
        var nenhum = PalavrasChaveNormalizer.PreferirTabela(Array.Empty<string>(), null);

        Assert.Equal(new[] { "mesa" }, daTabela);
        Assert.Equal(new[] { "json" }, soJson);
        Assert.Empty(nenhum);
    }
}
