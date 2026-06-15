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
        var sucesso =
            await _brevoService.EnviarContato(
                request.Nome,
                request.Email,
                request.Assunto,
                request.Mensagem);

        if (!sucesso)
        {
            return BadRequest(
                "Erro ao enviar email");
        }

        return Ok(new
        {
            mensagem = "Contato enviado"
        });
    }
}