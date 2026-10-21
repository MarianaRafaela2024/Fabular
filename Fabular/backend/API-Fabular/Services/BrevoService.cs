using System.Text;
using System.Text.Json;

namespace API_Fabular.Services;

public class BrevoService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<BrevoService> _logger;

    public BrevoService(
        IConfiguration configuration,
        HttpClient httpClient,
        ILogger<BrevoService> logger)
    {
        _configuration = configuration;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> EnviarContato(
        string nome,
        string email,
        string assunto,
        string mensagem)
    {
        var apiKey = _configuration["Brevo:ApiKey"]?.Trim();
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogError("Brevo:ApiKey não configurada para envio de contato.");
            return false;
        }

        var fromEmail = _configuration["Brevo:FromEmail"] ?? "fabularleitura@gmail.com";
        var fromName = _configuration["Brevo:FromName"] ?? "FABULAR";
        var supportEmail = _configuration["Brevo:SupportEmail"] ?? fromEmail;

        var body = new
        {
            sender = new
            {
                name = fromName,
                email = fromEmail
            },

            to = new[]
            {
                new
                {
                    email = supportEmail,
                    name = "Equipe Fabular"
                }
            },

            replyTo = new
            {
                email,
                name = nome
            },

            subject = $"Contato [{ValidacaoCampos.EscaparHtml(assunto)}]: {ValidacaoCampos.EscaparHtml(nome)}",

            htmlContent = $@"
                <h2>Novo contato</h2>

                <p><b>Nome:</b> {ValidacaoCampos.EscaparHtml(nome)}</p>

                <p><b>Email:</b> {ValidacaoCampos.EscaparHtml(email)}</p>

                <p><b>Assunto:</b> {ValidacaoCampos.EscaparHtml(assunto)}</p>

                <p><b>Mensagem:</b></p>

                <p>{ValidacaoCampos.EscaparHtml(mensagem).Replace("\n", "<br/>")}</p>
            "
        };

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(body),
                    Encoding.UTF8,
                    "application/json")
            };

            request.Headers.Add("api-key", apiKey);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                _logger.LogError(
                    "Erro ao enviar contato via Brevo: Status {StatusCode} - Resposta: {ResponseBody}",
                    response.StatusCode,
                    responseBody);
                return false;
            }

            _logger.LogInformation("Mensagem de contato de {Email} enviada com sucesso para {SupportEmail}.", email, supportEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exceção ao enviar mensagem de contato de {Email} via Brevo.", email);
            return false;
        }
    }
}
