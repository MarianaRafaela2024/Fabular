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
        if (!ValidacaoCampos.TentarNormalizarNome(request.Nome, out var nome))
        {
            return ApplicationResult<bool>.BadRequest(ValidacaoCampos.MensagemNome);
        }

        if (!ValidacaoCampos.TentarNormalizarEmail(request.Email, out var email))
        {
            return ApplicationResult<bool>.BadRequest(ValidacaoCampos.MensagemEmail);
        }

        if (!ValidacaoCampos.TentarNormalizarAssuntoContato(request.Assunto, out var assunto))
        {
            return ApplicationResult<bool>.BadRequest(ValidacaoCampos.MensagemAssunto);
        }

        if (!ValidacaoCampos.TentarNormalizarMensagemContato(request.Mensagem, out var mensagem))
        {
            return ApplicationResult<bool>.BadRequest(ValidacaoCampos.MensagemContato);
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
