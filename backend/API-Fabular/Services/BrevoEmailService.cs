using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace API_Fabular.Services;

public class BrevoEmailService
{
    private const string BrevoApiBaseUrl = "https://api.brevo.com/v3";
    private readonly BrevoEmailOptions _options;
    private readonly ILogger<BrevoEmailService> _logger;

    public BrevoEmailService(IOptions<BrevoEmailOptions> options, ILogger<BrevoEmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public bool IsConfigured()
    {
        var smtpPassword = GetSmtpPassword();
        return !string.IsNullOrWhiteSpace(_options.SmtpHost)
               && _options.SmtpPort > 0
               && !string.IsNullOrWhiteSpace(_options.SmtpUser)
               && !string.IsNullOrWhiteSpace(smtpPassword)
               && !string.IsNullOrWhiteSpace(_options.FromEmail);
    }

    public bool IsCrmConfigured() => !string.IsNullOrWhiteSpace(_options.ApiKey);

    public async Task UpsertContactInCrmAsync(string email, string? nome, string? assunto)
    {
        if (!IsCrmConfigured())
        {
            _logger.LogWarning("Brevo CRM não configurado. Contato {Email} não foi sincronizado.", email);
            return;
        }

        var payload = new
        {
            email,
            updateEnabled = true,
            attributes = new
            {
                NOME = nome ?? string.Empty,
                ASSUNTO = assunto ?? string.Empty
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, $"{BrevoApiBaseUrl}/contacts");
        request.Headers.TryAddWithoutValidation("api-key", _options.ApiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var http = new HttpClient();
        var response = await http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            _logger.LogWarning("Brevo CRM retornou erro ao sincronizar {Email}. Status: {Status}. Body: {Body}", email, (int)response.StatusCode, body);
        }
    }

    public async Task SendPasswordResetCodeAsync(string emailDestino, string codigo)
    {
        if (!IsConfigured())
        {
            _logger.LogError("Brevo SMTP não configurado. E-mail de recuperação não pode ser enviado para {Email}.", emailDestino);
            throw new InvalidOperationException("Serviço de e-mail Brevo não configurado.");
        }

        using var message = new MailMessage();
        message.From = new MailAddress(_options.FromEmail!, _options.FromName ?? "Mundo das Historias");
        message.To.Add(emailDestino);
        message.Subject = "Recuperacao de senha - Mundo das Historias";
        message.Body = $"Seu codigo de recuperacao e: {codigo}\n\nEsse codigo expira em 10 minutos.";

        using var client = new SmtpClient(_options.SmtpHost!, _options.SmtpPort)
        {
            EnableSsl = _options.EnableSsl,
            Credentials = new NetworkCredential(_options.SmtpUser, GetSmtpPassword())
        };

        await client.SendMailAsync(message);
    }

    public async Task SendContactMessageToSupportAsync(string nome, string email, string assunto, string mensagem)
    {
        if (!IsConfigured())
        {
            _logger.LogError("Brevo SMTP não configurado. Mensagem de contato não pode ser enviada.");
            throw new InvalidOperationException("Serviço de e-mail Brevo não configurado.");
        }

        var supportEmail = _options.SupportEmail ?? _options.FromEmail!;
        using var message = new MailMessage();
        message.From = new MailAddress(_options.FromEmail!, _options.FromName ?? "Mundo das Historias");
        message.To.Add(supportEmail);
        message.ReplyToList.Add(new MailAddress(email, nome));
        message.Subject = $"[Contato Site] {assunto}";
        message.Body = $"Nome: {nome}\nEmail: {email}\nAssunto: {assunto}\n\nMensagem:\n{mensagem}";

        using var client = new SmtpClient(_options.SmtpHost!, _options.SmtpPort)
        {
            EnableSsl = _options.EnableSsl,
            Credentials = new NetworkCredential(_options.SmtpUser, GetSmtpPassword())
        };

        await client.SendMailAsync(message);
    }

    private string GetSmtpPassword()
    {
        return _options.SmtpPassword ?? string.Empty;
    }
}

public class BrevoEmailOptions
{
    public string? ApiKey { get; set; }
    public string? SmtpHost { get; set; }
    public int SmtpPort { get; set; } = 587;
    public string? SmtpUser { get; set; }
    public string? SmtpPassword { get; set; }
    public string? FromEmail { get; set; }
    public string? FromName { get; set; }
    public string? SupportEmail { get; set; }
    public bool EnableSsl { get; set; } = true;
}
