using API_Fabular.Contracts;
using API_Fabular.Services;
using Microsoft.AspNetCore.Mvc;

namespace API_Fabular.Controllers;

[ApiController]
[Route("api/v1/children")]
public class ChildrenController : ControllerBase
{
    private readonly ChildrenLinkService _childrenLinkService;

    public ChildrenController(ChildrenLinkService childrenLinkService)
    {
        _childrenLinkService = childrenLinkService;
    }

    [HttpPost("link-local")]
    public async Task<ActionResult<object>> LinkLocal([FromBody] LinkLocalChildrenRequest request)
    {
        var result = await _childrenLinkService.LinkLocalAsync(request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }

        return Ok(result.Value);
    }
}
