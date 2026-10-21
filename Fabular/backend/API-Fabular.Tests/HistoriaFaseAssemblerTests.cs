using API_Fabular.Services;

namespace API_Fabular.Tests;

public class HistoriaFaseAssemblerTests
{
    [Fact]
    public void Concatenar_junta_textos_por_ordem_com_espaco()
    {
        var fases = new[]
        {
            new HistoriaFaseDto(2, "depois", null),
            new HistoriaFaseDto(1, "antes", "🌙")
        };

        Assert.Equal("antes depois", HistoriaFaseAssembler.Concatenar(fases));
    }

    [Fact]
    public void Concatenar_vazio_usa_fallback_TextoHtml()
    {
        Assert.Equal("bloco", HistoriaFaseAssembler.Concatenar(Array.Empty<HistoriaFaseDto>(), "bloco"));
        Assert.Equal(string.Empty, HistoriaFaseAssembler.Concatenar(null, null));
    }

    [Fact]
    public void DeTextoUnico_uma_fase_ordem_1()
    {
        var fases = HistoriaFaseAssembler.DeTextoUnico("  Era uma vez.  ", "🌙🦁");

        Assert.Single(fases);
        Assert.Equal((byte)1, fases[0].Ordem);
        Assert.Equal("Era uma vez.", fases[0].TextoHtml);
        Assert.Equal("🌙🦁", fases[0].Cena);
    }

    [Fact]
    public void DeTextoUnico_vazio_nao_gera_fase()
    {
        Assert.Empty(HistoriaFaseAssembler.DeTextoUnico("  ", "🌟"));
        Assert.Empty(HistoriaFaseAssembler.DeTextoUnico(null, null));
    }

    [Fact]
    public void DePayloadJson_extrai_fases_camelCase()
    {
        const string json = """{"idOriginal":"n1","fases":[{"texto":"um","cena":"🌙"},{"texto":"dois"}]}""";

        var fases = HistoriaFaseAssembler.DePayloadJson(json, "fallback", "🌟");

        Assert.Equal(2, fases.Count);
        Assert.Equal("um", fases[0].TextoHtml);
        Assert.Equal("🌙", fases[0].Cena);
        Assert.Equal((byte)2, fases[1].Ordem);
        Assert.Equal("dois", fases[1].TextoHtml);
        Assert.Equal("🌟", fases[1].Cena);
    }

    [Fact]
    public void DePayloadJson_aceita_PascalCase_Fases_Texto()
    {
        const string json = """{"Fases":[{"Texto":"A"},{"Texto":"B"}]}""";

        var fases = HistoriaFaseAssembler.DePayloadJson(json, "x", null);

        Assert.Equal(new[] { "A", "B" }, fases.Select(f => f.TextoHtml));
    }

    [Fact]
    public void DePayloadJson_sem_fases_usa_TextoHtml()
    {
        const string json = """{"Id":1,"Titulo":"IA","Texto":"do dto"}""";

        var fases = HistoriaFaseAssembler.DePayloadJson(json, "coluna html", "🌟");

        Assert.Single(fases);
        Assert.Equal("coluna html", fases[0].TextoHtml);
        Assert.Equal("🌟", fases[0].Cena);
    }

    [Fact]
    public void DePayloadJson_invalido_nao_inventa_fases_usa_TextoHtml()
    {
        var fases = HistoriaFaseAssembler.DePayloadJson("{isto nao e json", "seguro", "📖");

        Assert.Single(fases);
        Assert.Equal("seguro", fases[0].TextoHtml);
    }

    [Fact]
    public void DePayloadJson_fases_vazias_ou_sem_texto_usam_TextoHtml()
    {
        var vazio = HistoriaFaseAssembler.DePayloadJson("""{"fases":[]}""", "html", null);
        var semTexto = HistoriaFaseAssembler.DePayloadJson("""{"fases":[{"cena":"x"}]}""", "html", null);

        Assert.Equal("html", vazio[0].TextoHtml);
        Assert.Equal("html", semTexto[0].TextoHtml);
    }

    [Fact]
    public void DePayloadJson_pula_texto_vazio_e_preserva_ordem_do_indice()
    {
        const string json = """{"fases":[{"texto":"casa"},{"texto":"  "},{"texto":"bola"}]}""";

        var fases = HistoriaFaseAssembler.DePayloadJson(json, "x", null);

        Assert.Equal(new[] { ((byte)1, "casa"), ((byte)3, "bola") }, fases.Select(f => (f.Ordem, f.TextoHtml)));
    }

    [Fact]
    public void TruncarCena_corta_em_40()
    {
        var longa = new string('a', 50);
        Assert.Equal(40, HistoriaFaseAssembler.TruncarCena(longa)!.Length);
        Assert.Null(HistoriaFaseAssembler.TruncarCena("  "));
    }
}
