using ShahBuyerAuthApi.Application.Services.Interfaces;
using ShahBuyerAuthApi.Contracts.DTOs.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ShahBuyerAuthApi.Presentation.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("Login")]
    public async Task<IActionResult> LoginAsync(BuyerLoginRequestDTO request)
    {
        return Ok(await _authService.LoginAsync(request));
    }
    
    
    [HttpPost("RefreshToken")]
    public async Task<IActionResult> RefreshTokenAsync(string token)
    {
        return Ok(await _authService.RefreshTokenAsync(token));
    }

    [Authorize]
    [HttpPost("Logout")]
    public async Task<IActionResult> Logout()
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        var token = authHeader.StartsWith("Bearer ") ? authHeader.Substring(7) : authHeader;
        var result = await _authService.LogoutAsync(token);
        return Ok(result);
    }
}