using API_Fabular.Contracts;

namespace API_Fabular.Services;

public class ContactService
{
    private static readonly HashSet<string> AssuntosPermitidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "duvida-geral",
        "parceria",
        "suporte-tecnico",
        "recuperacao-email",
        "outro"
    };

    private readonly BrevoEmailService _brevoEmailService;
    private readonly ILogger<ContactService> _logger;

    public ContactService(BrevoEmailService brevoEmailService, ILogger<ContactService> logger)
    {
        _brevoEmailService = brevoEmailService;
        _logger = logger;
    }

    public async Task<ApplicationResult<bool>> SendMessageAsync(ContactMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Assunto) ||
            string.IsNullOrWhiteSpace(request.Mensagem))
        {
            return ApplicationResult<bool>.BadRequest("Preencha nome, e-mail, assunto e mensagem.");
        }

        var nome = request.Nome.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        var assunto = request.Assunto.Trim().ToLowerInvariant();
        var mensagem = request.Mensagem.Trim();

        if (!AssuntosPermitidos.Contains(assunto))
        {
            return ApplicationResult<bool>.BadRequest("Assunto de contato inválido.");
        }

        if (mensagem.Length < 10)
        {
            return ApplicationResult<bool>.BadRequest("A mensagem precisa ter ao menos 10 caracteres.");
        }

        if (!_brevoEmailService.IsConfigured())
        {
            _logger.LogError("Tentativa de envio de contato sem Brevo SMTP configurado.");
            return ApplicationResult<bool>.InternalError("Serviço de e-mail indisponível no momento.");
        }

        try
        {
            await _brevoEmailService.UpsertContactInCrmAsync(email, nome, assunto);
            await _brevoEmailService.SendContactMessageToSupportAsync(nome, email, assunto, mensagem);
            return ApplicationResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao enviar mensagem de contato do email {Email}", email);
            return ApplicationResult<bool>.InternalError("Não foi possível enviar sua mensagem agora.");
        }
    }
}
