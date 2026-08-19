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

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateChildRequest request)
    {
        var result = await _childrenLinkService.CreateChildAsync(request);

        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }

        return Ok(new { id = result.Value });
    }

    [HttpGet]
    public async Task<ActionResult> Get([FromQuery] int responsavelId)
    {
        var result = await _childrenLinkService.GetChildrenAsync(responsavelId);

        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Error });

        return Ok(result.Value);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateChildRequest request)
    {
        var result = await _childrenLinkService.UpdateChildAsync(id, request);

        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }

        return Ok(result.Value);
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
