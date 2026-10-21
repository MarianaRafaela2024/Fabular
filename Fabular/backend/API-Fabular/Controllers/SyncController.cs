using API_Fabular.Contracts;
using API_Fabular.Services;
using Microsoft.AspNetCore.Mvc;

namespace API_Fabular.Controllers;
/**/
[ApiController]
[Route("api/v1/sync")]
public class SyncController : ControllerBase
{
    private readonly ProgressSyncService _progressSyncService;

    public SyncController(ProgressSyncService progressSyncService)
    {
        _progressSyncService = progressSyncService;
    }

    [HttpPost("progress")]
    public async Task<ActionResult<object>> SyncProgress([FromBody] SyncProgressRequest request)
    {
        var result = await _progressSyncService.SyncProgressAsync(request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }

        return Ok(result.Value);
    }

    [HttpGet("progress")]
    public async Task<ActionResult<ProgressResponseDto>> GetProgress([FromQuery] int responsavelId, [FromQuery] int criancaId)
    {
        var result = await _progressSyncService.GetProgressAsync(responsavelId, criancaId);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }

        return Ok(result.Value);
    }
}
