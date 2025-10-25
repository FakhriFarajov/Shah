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
    public async Task<IActionResult> RefreshTokenAsync([FromBody] RefreshRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.RefreshToken))
            return BadRequest("Refresh token is required");

        var oldAccessToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

        var result = await _authService.RefreshTokenAsync(new RefreshRequest
        {
            RefreshToken = request.RefreshToken,
            OldAccessToken = oldAccessToken
        });

        if (!result.IsSuccess)
            return Unauthorized(result.Message);

        return Ok(result.Data); // Return new accessToken & refreshToken
    }



    [Authorize(Policy = "BuyerPolicy")] // Require Bearer token
    [HttpPost("Logout")]
    public async Task<IActionResult> Logout()
    {
        // Extract the Bearer token from the Authorization header
        var authHeader = Request.Headers["Authorization"].ToString();
        var token = authHeader.StartsWith("Bearer ") ? authHeader.Substring(7) : authHeader;

        if (string.IsNullOrEmpty(token))
        {
            return BadRequest(new 
            { 
                isSuccess = false, 
                message = "No access token provided" 
            });
        }

        // Call the AuthService to logout (blacklist the token)
        var result = await _authService.LogoutAsync(token);

        return Ok(result); // result already contains success info
    }

}