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
        var apiKey = _options.ApiKey?.Trim();
        var fromEmail = _options.FromEmail?.Trim();

        var configurado = !string.IsNullOrWhiteSpace(apiKey) && !string.IsNullOrWhiteSpace(fromEmail);
        if (!configurado)
        {
            _logger.LogWarning("BrevoEmailService não configurado. ApiKey preenchida: {HasApiKey}, FromEmail: {FromEmail}",
                !string.IsNullOrWhiteSpace(apiKey),
                fromEmail);
        }

        return configurado;
    }

    public bool IsCrmConfigured()
    {
        return !string.IsNullOrWhiteSpace(_options.ApiKey?.Trim());
    }

    public async Task SendPasswordResetCodeAsync(string email, string codigo)
    {
        var codigoSeguro = System.Net.WebUtility.HtmlEncode(codigo);
        var fromName = string.IsNullOrWhiteSpace(_options.FromName) ? "FABULAR" : _options.FromName.Trim();
        var fromEmail = _options.FromEmail!.Trim();

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
                    email
                }
            },

            subject = "Código de recuperação de senha - FABULAR",

            htmlContent = $@"
                <div style=""font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; color: #2d3748; line-height: 1.6;"">
                    <h2 style=""color: #5c3be8;"">Recuperação de senha - FABULAR</h2>
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta de responsável no <strong>FABULAR</strong>.</p>
                    <p>Use o código abaixo na tela de recuperação. Não compartilhe este código com ninguém.</p>
                    <p style=""margin: 24px 0; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #5c3be8;"">{codigoSeguro}</p>
                    <hr style=""border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;"" />
                    <p style=""font-size: 12px; color: #a0aec0;"">Este código expira em 15 minutos e só pode ser usado uma única vez. Se você não solicitou a troca de senha, pode ignorar este e-mail com segurança.</p>
                </div>"
        };

        await SendEmailAsync(body);
    }

    public async Task SendReadingReminderAsync(
        string email,
        string nomeCrianca)
    {
        var nomeSanitizado = System.Net.WebUtility.HtmlEncode(nomeCrianca);
        var fromName = string.IsNullOrWhiteSpace(_options.FromName) ? "FABULAR" : _options.FromName.Trim();
        var fromEmail = _options.FromEmail!.Trim();

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
                    email
                }
            },

            subject = "Hora da leitura! - FABULAR",

            htmlContent = $@"
                <div style=""font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; color: #2d3748; line-height: 1.6;"">
                    <h2 style=""color: #5c3be8;"">Hora da leitura!</h2>
                    <p>Está na hora de <strong>{nomeSanitizado}</strong> entrar no Fabular e continuar sua história!</p>
                </div>"
        };

        await SendEmailAsync(body);
    }

    private async Task SendEmailAsync(object body)
    {
        if (!IsConfigured())
        {
            throw new InvalidOperationException("Brevo não configurado.");
        }

        var apiKey = _options.ApiKey!.Trim();
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json")
        };

        request.Headers.Add("api-key", apiKey);

        var response = await _httpClient.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError(
                "Erro Brevo: {Status} - {Body}",
                response.StatusCode,
                responseBody);

            throw new Exception($"Erro Brevo: {response.StatusCode} - {responseBody}");
        }

        _logger.LogInformation("E-mail enviado com sucesso via Brevo.");
    }
}
