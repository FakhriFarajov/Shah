using ShahBuyerAuthApi.Application.Services.Interfaces;
using ShahBuyerAuthApi.Contracts.DTOs.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ShahBuyerAuthApi.Presentation.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly ITokenService _tokenService;
    private readonly IBuyerService _buyerService;
    
    public AccountController(IAccountService accountService, ITokenService tokenService, IBuyerService buyerService)
    {
        _accountService = accountService;
        _tokenService = tokenService;
        _buyerService = buyerService;
    }

    [Authorize] //We need to send a Bearer token in the header to access this endpoint
    [HttpPost("ConfirmEmail")]
    public async Task<IActionResult> ConfirmEmailAsync()
    {
        var token = await _tokenService.CreateEmailTokenAsync(User);
        await _accountService.ConfirmEmailAsync(User, token, HttpContext);

        return Ok("Email Confirmation Sent");
    }

    [HttpGet("VerifyToken/{id}/{token}")]
    public async Task<IActionResult> VerifyEmailAsync(string id, string token)
    {
        var res = await _tokenService.ValidateEmailTokenAsync(token);
        if (!res)
        {
            throw new Exception("Error token confirmation");
        }
        var emailFromToken = await _tokenService.GetEmailFromTokenAsync(token);
        var idByEmail = await _buyerService.GetIdByEmailAsync(emailFromToken);

        if (id == idByEmail)
        {
            return Ok(await _accountService.VerifyEmailAsync(id));
        }

        throw new Exception("Error token confirmation");
    }
}

