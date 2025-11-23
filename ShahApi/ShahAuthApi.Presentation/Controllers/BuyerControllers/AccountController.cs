using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAuthApi.Application.Services.Buyer.Interfaces;
using ShahAuthApi.Application.Services.Utils;
using ShahAuthApi.Core.DTOs.BuyerDtos.Request;

namespace ShahAuthApi.Presentation.Controllers.BuyerControllers;

[ApiController]
[Route("api/Buyer/[controller]")]
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

    [HttpPost("ConfirmEmail")]
    public async Task<IActionResult> ConfirmEmailAsync()
    {
        var token = await _tokenService.CreateEmailTokenAsync(User);
        await _accountService.ConfirmEmailAsync(User, token, HttpContext);
        return Ok("Email Confirmation Sent");
    }

    [HttpGet("VerifyToken/{id}/{token}")]
    public async Task<IActionResult> VerifyTokenAsync(string id, string token)
    {
        var res = await _tokenService.ValidateEmailTokenAsync(token);
        if (!res)
        {
            // Redirect to a cool failure page
            return Redirect("http://localhost:5174/email-confirmation?status=failure");
        }

        var emailFromToken = await _tokenService.GetEmailFromTokenAsync(token);
        var idByEmail = await _buyerService.GetIdByEmailAsync(emailFromToken);

        if (id == idByEmail)
        {
            await _accountService.VerifyEmailAsync(id);
            // Redirect to a cool success page
            return Redirect("http://localhost:5174/email-confirmation?status=success");
        }

        // Redirect to a cool failure page
        return Redirect("http://localhost:5174/email-confirmation?status=failure");
    }
    
    [Authorize(Policy = "BuyerPolicy")] //We need to send a Bearer token in the header to access this endpoint
    [HttpPost("ChangePassword")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDTO request)
    {
        var result = await _accountService.ChangePassword(request);
        return Ok(result);
    }
}
