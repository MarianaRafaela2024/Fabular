using API_Fabular.Contracts;
using API_Fabular.Services;
using Microsoft.AspNetCore.Mvc;

namespace API_Fabular.Controllers;

[ApiController]
[Route("api/v1/parents")]
public class AuthController : ControllerBase
{
    private readonly ParentAuthService _authService;

    public AuthController(ParentAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<ParentAuthResponse>> Register([FromBody] ParentRegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }

        return Ok(result.Value);
    }

    [HttpPost("login")]
    public async Task<ActionResult<ParentAuthResponse>> Login([FromBody] ParentLoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }

        return Ok(result.Value);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ParentProfileResponse>> GetProfile(int id)
    {
        var result = await _authService.GetProfileAsync(id);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }

        return Ok(result.Value);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ParentProfileResponse>> UpdateProfile(int id, [FromBody] UpdateParentRequest request)
    {
        var result = await _authService.UpdateProfileAsync(id, request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }

        return Ok(result.Value);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ParentForgotPasswordRequest request)
    {
        var result = await _authService.RequestPasswordResetAsync(request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }

        return Ok(new { message = "Se o e-mail estiver cadastrado, enviamos um código de recuperação." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ParentResetPasswordRequest request)
    {
        var result = await _authService.ResetPasswordAsync(request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Error });
        }

        return Ok(new { message = "Senha atualizada com sucesso." });
    }
}
