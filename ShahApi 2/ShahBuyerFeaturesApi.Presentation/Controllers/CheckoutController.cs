using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Request;

namespace ShahBuyerFeaturesApi.Presentation.Controllers;

[ApiController]
[Authorize(Policy = "BuyerPolicy")] // requires Buyer token
[Route("api/[controller]")]
public class CheckoutController : ControllerBase
{
    private readonly ICheckoutService _checkoutService;

    public CheckoutController(ICheckoutService checkoutService)
    {
        _checkoutService = checkoutService;
    }

    [HttpPost]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequestDto? request)
    {
        request ??= new CheckoutRequestDto();
        var buyerId = GetUserIdFromClaims();
        var result = await _checkoutService.CheckoutAsync(buyerId, request);
        return Ok(result);
    }

    private string GetUserIdFromClaims()
    {
        if (!(User?.Identity?.IsAuthenticated ?? false))
            return string.Empty;

        return User.FindFirst("id")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? string.Empty;
    }
}

