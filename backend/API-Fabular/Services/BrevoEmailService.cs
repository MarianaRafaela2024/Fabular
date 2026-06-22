using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace API_Fabular.Services;

public class BrevoEmailService
{
    private readonly HttpClient _httpClient;
    private readonly BrevoEmailOptions _options;
    private readonly ILogger<BrevoEmailService> _logger;

    public BrevoEmailService(
        HttpClient httpClient,
        IOptions<BrevoEmailOptions> options,
        ILogger<BrevoEmailService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public bool IsConfigured()
    {
        _logger.LogInformation(
            "ApiKey: {ApiKey} | FromEmail: {FromEmail}",
            _options.ApiKey,
            _options.FromEmail);

        return !string.IsNullOrWhiteSpace(_options.ApiKey)
               && !string.IsNullOrWhiteSpace(_options.FromEmail);
    }

    public bool IsCrmConfigured()
    {
        return !string.IsNullOrWhiteSpace(_options.ApiKey);
    }

    public async Task SendPasswordResetCodeAsync(
        string email,
        string codigo)
    {
        var body = new
        {
            sender = new
            {
                name = _options.FromName,
                email = _options.FromEmail
            },

            to = new[]
            {
                new
                {
                    email
                }
            },

            subject = "Recuperação de Senha - FABULAR",

            htmlContent = $@"
                <h2>Recuperação de Senha</h2>
                <p>Seu código de recuperação é:</p>
                <h1>{codigo}</h1>
                <p>O código expira em 10 minutos.</p>"
        };

        await SendEmailAsync(body);
    }

    public async Task SendContactMessageToSupportAsync(
        string nome,
        string email,
        string assunto,
        string mensagem)
    {
        var body = new
        {
            sender = new
            {
                name = _options.FromName,
                email = _options.FromEmail
            },

            to = new[]
            {
                new
                {
                    email = _options.SupportEmail
                }
            },

            replyTo = new
            {
                email,
                name = nome
            },

            subject = $"[Contato Site] {assunto}",

            htmlContent = $@"
                <h3>Nova mensagem de contato</h3>

                <p><strong>Nome:</strong> {nome}</p>

                <p><strong>Email:</strong> {email}</p>

                <p><strong>Assunto:</strong> {assunto}</p>

                <p><strong>Mensagem:</strong></p>

                <p>{mensagem}</p>"
        };

        await SendEmailAsync(body);
    }

    public async Task UpsertContactInCrmAsync(
        string email,
        string nome,
        string assunto)
    {
        if (!IsCrmConfigured())
            return;

        var body = new
        {
            email,

            attributes = new
            {
                FIRSTNAME = nome,
                ASSUNTO = assunto
            },

            updateEnabled = true
        };

        _httpClient.DefaultRequestHeaders.Clear();

        _httpClient.DefaultRequestHeaders.Add(
            "api-key",
            _options.ApiKey);

        var content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json");

        var response = await _httpClient.PostAsync(
            "https://api.brevo.com/v3/contacts",
            content);

        if (!response.IsSuccessStatusCode)
        {
            var erro =
                await response.Content.ReadAsStringAsync();

            _logger.LogWarning(
                "Falha ao sincronizar contato no CRM Brevo: {Erro}",
                erro);
        }
    }

    private async Task SendEmailAsync(object body)
    {
        if (!IsConfigured())
        {
            throw new InvalidOperationException(
                "Brevo não configurado.");
        }

        _httpClient.DefaultRequestHeaders.Clear();

        _httpClient.DefaultRequestHeaders.Add(
            "api-key",
            _options.ApiKey);

        var content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json");

        var response = await _httpClient.PostAsync(
            "https://api.brevo.com/v3/smtp/email",
            content);

        var responseBody =
            await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError(
                "Erro Brevo: {Status} - {Body}",
                response.StatusCode,
                responseBody);

            throw new Exception(
                $"Erro Brevo: {response.StatusCode} - {responseBody}");
        }
    }
}

