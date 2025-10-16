using ShahAdminAuthApi.Application.Services.Interfaces;
using ShahAdminAuthApi.Contracts.DTOs.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAdminAuthApi.Application.Utils;

namespace ShahAdminAuthApi.Presentation.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [Authorize]
    [HttpPost("Register")]
    public async Task<IActionResult> RegisterAsync([FromBody] AdminRegisterRequestDTO requestDto)
    {
        var res = await _accountService.RegisterAdminAsync(requestDto);
        return Ok(res);
    }

    [Authorize]
    [HttpPost("ForgotPassword")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDTO request)
    {
        var result = await _accountService.ForgotPasswordAsync(request.Email, request.NewPassword, request.OldPassword);
        return Ok(result);
    }
}

