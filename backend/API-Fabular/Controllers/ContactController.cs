using API_Fabular.Contracts;
using API_Fabular.Services;
using Microsoft.AspNetCore.Mvc;

namespace API_Fabular.Controllers;

[ApiController]
[Route("api/v1/contact")]
public class ContactController : ControllerBase
{
    private readonly ContactService _contactService;

    public ContactController(ContactService contactService)
    {
        _contactService = contactService;
    }

    [HttpPost("messages")]
    public async Task<IActionResult> SendMessage([FromBody] ContactMessageRequest request)
    {
        var result = await _contactService.SendMessageAsync(request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }

        return Ok(new { message = "Mensagem enviada com sucesso." });
    }
}
