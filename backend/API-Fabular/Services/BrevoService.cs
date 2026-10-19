using System.Text;
using System.Text.Json;

namespace API_Fabular.Services;

public class BrevoService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public BrevoService(
        IConfiguration configuration,
        HttpClient httpClient)
    {
        _configuration = configuration;
        _httpClient = httpClient;
    }

    public async Task<bool> EnviarContato(
        string nome,
        string email,
        string assunto,
        string mensagem)
    {
        var apiKey =
            _configuration["Brevo:ApiKey"];

        _httpClient.DefaultRequestHeaders.Clear();

        _httpClient.DefaultRequestHeaders.Add(
            "api-key",
            apiKey);

        var body = new
        {
            sender = new
            {
                name = "FABULAR",
                email = "fabularleitura@gmail.com"
            },

            to = new[]
            {
                new
                {
                    email = "fabularleitura@gmail.com",
                    name = "Equipe Fabular"
                }
            },

            subject = $"Contato: {ValidacaoCampos.EscaparHtml(assunto)}",

            htmlContent = $@"
                <h2>Novo contato</h2>

                <p><b>Nome:</b> {ValidacaoCampos.EscaparHtml(nome)}</p>

                <p><b>Email:</b> {ValidacaoCampos.EscaparHtml(email)}</p>

                <p><b>Assunto:</b> {ValidacaoCampos.EscaparHtml(assunto)}</p>

                <p><b>Mensagem:</b></p>

                <p>{ValidacaoCampos.EscaparHtml(mensagem).Replace("\n", "<br/>")}</p>
            "
        };

        var content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json");

        var response =
            await _httpClient.PostAsync(
                "https://api.brevo.com/v3/smtp/email",
                content);

        return response.IsSuccessStatusCode;
    }
}