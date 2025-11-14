using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using System.Security.Claims;
using ShahBuyerFeaturesApi.Core.Enums;

namespace ShahBuyerFeaturesApi.Presentation.Controllers;

[ApiController]
[Authorize(Policy = "BuyerPolicy")] // requires Buyer token
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    // GET api/order/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderById(string id)
    {
        var buyerId = GetUserIdFromClaims();
        var result = await _orderService.GetOrderByIdAsync(id, buyerId);
        return Ok(result);
    }

    // GET api/order
    [HttpGet("buyerOrders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var buyerId = GetUserIdFromClaims();
        var result = await _orderService.GetOrdersForBuyerAsync(buyerId);
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

