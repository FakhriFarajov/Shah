using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAuthApi.Application.Services.Buyer.Interfaces;
using ShahAuthApi.Core.DTOs.BuyerDtos.Request;

namespace ShahAuthApi.Presentation.Controllers.BuyerControllers;


[ApiController]
[Route("api/Buyer/[controller]")]
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

    [Authorize(Policy = "BuyerPolicy")] //We need to send a Bearer token in the header to access this endpoint
    [HttpPost("Logout")]
    public async Task<IActionResult> Logout()
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        var token = authHeader.StartsWith("Bearer ") ? authHeader.Substring(7) : authHeader;
        var result = await _authService.LogoutAsync(token);
        return Ok(result);
    }
}