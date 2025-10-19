using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAuthApi.Application.Services.Seller.Interfaces;
using ShahAuthApi.Application.Services.Utils;
using ShahAuthApi.Core.DTOs.SellerDtos.Request;

namespace ShahAuthApi.Presentation.Controllers.SellerControllers;

[ApiController]
[Route("api/Seller/[controller]")]
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly TokenManager _tokenService;
    private readonly ISellerService _sellerService;

    public AccountController(IAccountService accountService, TokenManager tokenService, ISellerService sellerService)
    {
        _accountService = accountService;
        _tokenService = tokenService;
        _sellerService = sellerService;
    }

    [HttpPost("Register")]
    public async Task<IActionResult> RegisterAsync([FromBody] SellerRegisterRequestDTO requestDto)
    {
        // Remove normalization, use email as provided
        var res = await _accountService.RegisterSellerAsync(requestDto);
        return Ok(res);
    }

    [Authorize(Policy = "SellerPolicy")] //We need to send a Bearer token in the header to access this endpoint
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
        var idByEmail = await _sellerService.GetIdByEmailAsync(emailFromToken);

        if (id == idByEmail)
        {
            return Ok(await _accountService.VerifyEmailAsync(id));
        }

        throw new Exception("Error token confirmation");
    }
    
    
    [Authorize(Policy = "SellerPolicy")] //We need to send a Bearer token in the header to access this endpoint
    [HttpPost("ForgotPassword")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDTO request)
    {
        var result = await _accountService.ForgotPasswordAsync(request);
        return Ok(result);
    }
}