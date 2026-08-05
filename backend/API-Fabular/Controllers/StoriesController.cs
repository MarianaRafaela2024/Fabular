using API_Fabular.Contracts;
using API_Fabular.Services;
using Microsoft.AspNetCore.Mvc;

namespace API_Fabular.Controllers;

[ApiController]
[Route("api/v1/stories")]
public class StoriesController : ControllerBase
{
    private readonly StoriesService _storiesService;

    public StoriesController(StoriesService storiesService)
    {
        _storiesService = storiesService;
    }

    [HttpPost("generate")]
    public async Task<ActionResult<StoryDetailDto>> Generate([FromBody] StoryGenerateRequest request)
    {
        var result = await _storiesService.GenerateAsync(request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }
        return Ok(result.Value);
    }

    [HttpPost("save")]
    public async Task<ActionResult<StoryDetailDto>> Save([FromBody] StorySaveRequest request)
    {
        var result = await _storiesService.SaveAsync(request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }
        return Ok(result.Value);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StorySummaryDto>>> List(
        [FromQuery] int? faixaEtaria,
        [FromQuery] string? genero,
        [FromQuery] int? criancaId,
        [FromQuery] int? responsavelId)
    {
        var result = await _storiesService.ListAsync(faixaEtaria, genero, criancaId, responsavelId);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }
        return Ok(result.Value);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<StoryDetailDto>> GetById(int id, [FromQuery] int? criancaId)
    {
        var result = await _storiesService.GetByIdAsync(id, criancaId);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }
        return Ok(result.Value);
    }
}
