using ShahBuyerAuthApi.Application.Services.Interfaces;
using ShahBuyerAuthApi.Contracts.DTOs.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahBuyerAuthApi.Application.Utils;

namespace ShahBuyerAuthApi.Presentation.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly TokenManager _tokenService;
    private readonly IBuyerService _buyerService;

    public AccountController(IAccountService accountService, TokenManager tokenService, IBuyerService buyerService)
    {
        _accountService = accountService;
        _tokenService = tokenService;
        _buyerService = buyerService;
    }

    [HttpPost("Register")]
    public async Task<IActionResult> RegisterAsync([FromBody] BuyerRegisterRequestDTO requestDto)
    {
        var res = await _accountService.RegisterBuyerAsync(requestDto);
        return Ok(res);
    }

    [Authorize] //We need to send a Bearer token in the header to access this endpoint
    [HttpPost("ConfirmEmail")]
    public async Task<IActionResult> ConfirmEmailAsync()
    {
        var token = await _tokenService.CreateEmailTokenAsync(User);
        await _accountService.ConfirmEmailAsync(User, token, HttpContext);
        return Ok("Email Confirmation Sent");
    }

    [HttpGet("VerifyToken/{id}/{token}")] //This code is needed to verify email by tocken it is not supposed to be used directly
    public async Task<IActionResult> VerifyTokenAsync(string id, string token)
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
    
    [Authorize]
    [HttpPost("ForgotPassword")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDTO request)
    {
        var result = await _accountService.ForgotPasswordAsync(request);
        return Ok(result);
    }
}

