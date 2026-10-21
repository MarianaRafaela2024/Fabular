using API_Fabular.Contracts;
using API_Fabular.Services;

namespace API_Fabular.Tests;

public class StoryDetailAssemblerTests
{
    private static readonly StoryColumnSnapshot Colunas = new(
        7,
        "Titulo coluna",
        "narrativo",
        2,
        "6 min",
        "📖",
        "🌟",
        "Texto da coluna");

    private static readonly string PayloadCompleto = JsonPayload(
        titulo: "Titulo JSON",
        texto: "Texto do blob",
        palavras: new[] { "json" },
        tipoMinigame: "vf");

    [Fact]
    public void Montar_colunas_e_fases_vencem_payload_mesmo_se_o_blob_parseia()
    {
        var fases = new[] { new HistoriaFaseDto(1, "fase um", "🌙"), new HistoriaFaseDto(2, "fase dois", null) };
        var dto = StoryDetailAssembler.Montar(
            Colunas,
            fases,
            new[] { "mesa" },
            """["json-coluna"]""",
            new[] { new MinigameDto("escolha", "Q?", new { }) },
            PayloadCompleto);

        Assert.Equal(7, dto.Id);
        Assert.Equal("Titulo coluna", dto.Titulo);
        Assert.Equal("narrativo", dto.Genero);
        Assert.Equal(2, dto.FaixaEtaria);
        Assert.Equal("fase um fase dois", dto.Texto);
        Assert.Equal(new[] { "mesa" }, dto.PalavrasChave);
        Assert.Equal("escolha", dto.Minigames[0].Tipo);
    }

    [Fact]
    public void Montar_TextoHtml_vazio_sem_fases_usa_texto_do_payload()
    {
        var vazio = Colunas with { TextoHtml = "  " };
        var dto = StoryDetailAssembler.Montar(
            vazio,
            Array.Empty<HistoriaFaseDto>(),
            Array.Empty<string>(),
            null,
            Array.Empty<MinigameDto>(),
            PayloadCompleto);

        Assert.Equal("Texto do blob", dto.Texto);
        Assert.Equal("Titulo coluna", dto.Titulo);
        Assert.Equal(new[] { "json" }, dto.PalavrasChave);
        Assert.Equal("vf", dto.Minigames[0].Tipo);
    }

    [Fact]
    public void Montar_palavras_da_coluna_json_quando_tabela_vazia()
    {
        var dto = StoryDetailAssembler.Montar(
            Colunas,
            null,
            Array.Empty<string>(),
            """["sol","lua"]""",
            Array.Empty<MinigameDto>(),
            null);

        Assert.Equal(new[] { "sol", "lua" }, dto.PalavrasChave);
        Assert.Equal("Texto da coluna", dto.Texto);
    }

    [Fact]
    public void Montar_payload_invalido_nao_substitui_colunas()
    {
        var vazio = Colunas with { TextoHtml = "" };
        var dto = StoryDetailAssembler.Montar(
            vazio,
            Array.Empty<HistoriaFaseDto>(),
            Array.Empty<string>(),
            "{nao json",
            Array.Empty<MinigameDto>(),
            "{isto tampouco");

        Assert.Equal(string.Empty, dto.Texto);
        Assert.Equal("Titulo coluna", dto.Titulo);
        Assert.Empty(dto.PalavrasChave);
        Assert.Empty(dto.Minigames);
    }

    [Fact]
    public void TentarLerPayload_aceita_camelCase()
    {
        const string json = """{"id":1,"titulo":"T","genero":"poetico","faixaEtaria":1,"texto":"oi","palavrasChave":[],"minigames":[]}""";

        var dto = StoryDetailAssembler.TentarLerPayload(json);

        Assert.NotNull(dto);
        Assert.Equal("oi", dto!.Texto);
        Assert.Equal("poetico", dto.Genero);
    }

    [Fact]
    public void TentarLerPayload_seed_sem_Texto_nao_preenche_texto()
    {
        const string seed = """{"idOriginal":"n1","fases":[{"texto":"um"}]}""";
        var dto = StoryDetailAssembler.TentarLerPayload(seed);

        Assert.True(dto is null || string.IsNullOrWhiteSpace(dto.Texto));
    }

    private static string JsonPayload(string titulo, string texto, string[] palavras, string tipoMinigame)
    {
        return System.Text.Json.JsonSerializer.Serialize(new StoryDetailDto(
            99,
            titulo,
            "descritivo",
            3,
            "1 min",
            "x",
            "y",
            texto,
            palavras.ToList(),
            new List<MinigameDto> { new(tipoMinigame, "P?", new { }) }));
    }
}
