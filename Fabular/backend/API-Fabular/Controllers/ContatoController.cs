using API_Fabular.Contracts;
using API_Fabular.Services;
using Microsoft.AspNetCore.Mvc;

namespace API_Fabular.Controllers;

[ApiController]
[Route("api/contato")]
public class ContatoController : ControllerBase
{
    private readonly BrevoService _brevoService;
    private readonly ILogger<ContatoController> _logger;

    public ContatoController(
        BrevoService brevoService,
        ILogger<ContatoController> logger)
    {
        _brevoService = brevoService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Enviar(
        [FromBody] ContatoRequest request)
    {
        if (ValidacaoCampos.HoneypotPreenchido(request.Website))
        {
            return Ok(new { sucesso = true });
        }

        if (!ValidacaoCampos.TentarNormalizarNome(request.Nome, out var nome))
        {
            return BadRequest(new { message = ValidacaoCampos.MensagemNome });
        }

        if (!ValidacaoCampos.TentarNormalizarEmail(request.Email, out var email))
        {
            return BadRequest(new { message = ValidacaoCampos.MensagemEmail });
        }

        if (!ValidacaoCampos.TentarNormalizarAssuntoContato(request.Assunto, out var assunto))
        {
            return BadRequest(new { message = ValidacaoCampos.MensagemAssunto });
        }

        if (!ValidacaoCampos.TentarNormalizarMensagemContato(request.Mensagem, out var mensagem))
        {
            return BadRequest(new { message = ValidacaoCampos.MensagemContato });
        }

        try
        {
            var sucesso =
                await _brevoService.EnviarContato(
                    nome!,
                    email!,
                    assunto!,
                    mensagem!);

            if (!sucesso)
            {
                _logger.LogWarning("Falha no envio de contato para {Email} via BrevoService.", email);
                return StatusCode(500, new { message = "Não foi possível enviar sua mensagem agora." });
            }

            return Ok(new { sucesso });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exceção não tratada ao processar envio de contato de {Email}.", email);
            return StatusCode(500, new { message = "Não foi possível enviar sua mensagem agora." });
        }
    }
}
