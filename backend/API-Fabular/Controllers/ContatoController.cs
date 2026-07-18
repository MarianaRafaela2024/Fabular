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
        try
        {
            var sucesso =
                await _brevoService.EnviarContato(
                    request.Nome,
                    request.Email,
                    request.Assunto,
                    request.Mensagem);

            return Ok(new
            {
                sucesso
            });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.ToString());
        }
    }
}