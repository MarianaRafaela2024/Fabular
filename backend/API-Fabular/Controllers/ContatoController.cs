using API_Fabular.Contracts;
using API_Fabular.Services;
using Microsoft.AspNetCore.Mvc;

namespace API_Fabular.Controllers;

[ApiController]
[Route("api/contato")]
public class ContatoController : ControllerBase
{
    private readonly BrevoService _brevoService;

    public ContatoController(
        BrevoService brevoService)
    {
        _brevoService = brevoService;
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
                return StatusCode(500, new { message = "Não foi possível enviar sua mensagem agora." });
            }

            return Ok(new { sucesso });
        }
        catch
        {
            return StatusCode(500, new { message = "Não foi possível enviar sua mensagem agora." });
        }
    }
}
