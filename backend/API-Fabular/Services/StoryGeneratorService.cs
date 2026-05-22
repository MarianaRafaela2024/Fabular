using System.Text.Json;
using API_Fabular.Contracts;

namespace API_Fabular.Services;

public class StoryGeneratorService
{
    public StoryDetailDto Generate(StoryGenerateRequest request)
    {
        var faixa = Math.Clamp(request.FaixaEtaria, 1, 3);
        var genero = string.IsNullOrWhiteSpace(request.GeneroTextual) ? "narrativo" : request.GeneroTextual.ToLowerInvariant();
        var prompt = string.IsNullOrWhiteSpace(request.PromptCrianca) ? "Uma história divertida." : request.PromptCrianca.Trim();
        var tema = string.IsNullOrWhiteSpace(request.Tema) ? "amizade" : request.Tema.Trim();

        var texto = faixa switch
        {
            1 => $"Lia viu um {tema} no parque. Ela ficou curiosa e pediu ajuda para o amigo Beto. Juntos, eles resolveram o problema e voltaram para casa sorrindo. Ideia da criança: {prompt}",
            2 => $"No começo da tarde, Nina decidiu explorar o bairro para entender um mistério sobre {tema}. Primeiro, ela encontrou uma pista confusa. Depois, enfrentou dois obstáculos com a ajuda de um amigo e, no clímax, percebeu que a resposta estava em algo simples. No fim, os dois celebraram por terem aprendido juntos. Ideia da criança: {prompt}",
            _ => $"Quando Caio começou a investigar o tema {tema}, ele acreditava que seria uma tarefa simples. No entanto, cada descoberta trouxe um novo conflito e um ponto de vista diferente, inclusive sobre seus próprios medos. Ao reunir as pistas e conversar com quem discordava dele, Caio entendeu que resolver o problema exigia cooperação e senso de justiça. Ideia da criança: {prompt}"
        };

        var palavras = faixa switch
        {
            1 => new List<string> { "amigo", "parque", "ajuda", "sorriso", "casa" },
            2 => new List<string> { "mistério", "pista", "desafio", "confiança", "celebrar" },
            _ => new List<string> { "investigar", "conflito", "perspectiva", "cooperação", "justiça" }
        };

        var minigames = new List<MinigameDto>
        {
            new("escolha", "Qual foi o problema principal?", new { opcoes = new[] { "Encontrar a solução", "Fugir da história" }, correta = 0 }),
            new("jogo_memoria", "Encontre os pares!", new { pares = palavras.Select(p => new { palavra = p, emoji = EmojiParaPalavra(p) }).ToList() }),
            new("verdadeiro_falso", "A personagem resolveu o conflito?", new { opcoes = new[] { "Verdadeiro", "Falso" }, correta = 0 }),
            new("monta_frase", "Monte a frase sobre a história.", new { palavras = new[] { "A", "história", "terminou", "bem" }, resposta = "A história terminou bem" })
        };

        return new StoryDetailDto(
            0,
            $"História de {tema}",
            genero,
            faixa,
            faixa == 1 ? "5 min" : faixa == 2 ? "8 min" : "12 min",
            "📖",
            "🌟",
            texto,
            palavras,
            minigames
        );
    }

    public static string SerializeJson<T>(T value) => JsonSerializer.Serialize(value);

    private static string EmojiParaPalavra(string palavra)
    {
        var norm = NormalizarPalavra(palavra);
        if (string.IsNullOrEmpty(norm)) return "📝";

        var mapa = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["amigo"] = "👫", ["parque"] = "🛝", ["ajuda"] = "🤝", ["sorriso"] = "😊", ["casa"] = "🏠",
            ["misterio"] = "🔍", ["pista"] = "🔎", ["desafio"] = "🎯", ["confianca"] = "🤝", ["celebrar"] = "🎉",
            ["investigar"] = "🕵️", ["conflito"] = "⚡", ["perspectiva"] = "👁️", ["cooperacao"] = "🤝", ["justica"] = "⚖️",
            ["leao"] = "🦁", ["floresta"] = "🌳", ["noite"] = "🌙", ["lua"] = "🌙", ["corajoso"] = "💪",
            ["sol"] = "☀️", ["nuvem"] = "☁️", ["nuvens"] = "☁️", ["chuva"] = "🌧️", ["mar"] = "🌊",
            ["flor"] = "🌸", ["livro"] = "📚", ["escola"] = "🏫", ["gato"] = "🐱", ["cachorro"] = "🐶",
            ["coelho"] = "🐰", ["dragao"] = "🐉", ["estrela"] = "⭐", ["amizade"] = "🤝"
        };

        if (mapa.TryGetValue(norm, out var emoji)) return emoji;

        foreach (var kv in mapa.OrderByDescending(kv => kv.Key.Length))
        {
            if (norm.Contains(kv.Key, StringComparison.Ordinal) || kv.Key.Contains(norm, StringComparison.Ordinal))
                return kv.Value;
        }

        return "📝";
    }

    private static string NormalizarPalavra(string palavra)
    {
        if (string.IsNullOrWhiteSpace(palavra)) return string.Empty;
        var semAcento = palavra.Normalize(System.Text.NormalizationForm.FormD);
        var chars = semAcento.Where(c => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c)
            != System.Globalization.UnicodeCategory.NonSpacingMark).ToArray();
        return new string(chars).Normalize(System.Text.NormalizationForm.FormC)
            .ToLowerInvariant()
            .Trim();
    }
}
