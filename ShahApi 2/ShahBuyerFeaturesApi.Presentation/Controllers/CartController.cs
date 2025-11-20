using Microsoft.AspNetCore.Mvc;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using ShahBuyerFeaturesApi.Core.DTOs.Request;

namespace ShahBuyerFeaturesApi.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]        
[Authorize(Policy = "BuyerPolicy")] //We need to send a Bearer token in the header to access this endpoint
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] ProductVariantIdRequestDTO? request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.ProductVariantId))
            return BadRequest(new { success = false, error = "productVariantId is required" });

        var buyerId = GetUserIdFromClaims();
        await _cartService.AddToCart(request.ProductVariantId, buyerId);
        return Ok(new { success = true });
    }

    // DELETE api/cart/{productVariantId}
    [HttpDelete("delete/{productVariantId}")]
    public async Task<IActionResult> DeleteFromCart(string productVariantId)
    {
        if (string.IsNullOrWhiteSpace(productVariantId))
            return BadRequest(new { success = false, error = "productVariantId is required" });

        var buyerId = GetUserIdFromClaims();
        await _cartService.DeleteFromCart(productVariantId, buyerId);
        return Ok(new { success = true });
    }

    // POST api/cart/increase?productVariantId=...
    [HttpPost("increase")]
    public async Task<IActionResult> IncreaseQuantity([FromBody] ProductVariantIdRequestDTO? request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.ProductVariantId))
            return BadRequest(new { success = false, error = "productVariantId is required" });

        var buyerId = GetUserIdFromClaims();
        await _cartService.IncreaseQuantity(request.ProductVariantId, buyerId);
        return Ok(new { success = true });
    }

    // POST api/cart/decrease?productVariantId=...
    [HttpPost("decrease")]
    public async Task<IActionResult> DecreaseQuantity([FromBody] ProductVariantIdRequestDTO? request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.ProductVariantId))
            return BadRequest(new { success = false, error = "productVariantId is required" });

        var buyerId = GetUserIdFromClaims();
        await _cart_service_DecreaseQuantity_safe(request.ProductVariantId, buyerId);
        return Ok(new { success = true });
    }

    // DELETE api/cart/clear
    [HttpDelete("clear")]
    public async Task<IActionResult> DeleteAllCartItems()
    {
        var buyerId = GetUserIdFromClaims();
        await _cartService.DeleteAllCartItems(buyerId);
        return Ok(new { success = true });
    }

    // GET api/cart
    [HttpGet("getAll")]
    public async Task<IActionResult> GetAllCartItems()
    {
        var buyerId = GetUserIdFromClaims();
        var result = await _cartService.GetAllCartItems(buyerId);
        return Ok(result);
    }

    // wrapper to keep call site consistent for DecreaseQuantity
    private Task _cart_service_DecreaseQuantity_safe(string productVariantId, string buyerId)
    {
        return _cartService.DecreaseQuantity(productVariantId, buyerId);
    }

    private string GetUserIdFromClaims()
    {
        if (!(User?.Identity?.IsAuthenticated ?? false))
            return string.Empty; // keep method non-nullable for ICartService; service should handle empty buyerId

        return User.FindFirst("id")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? string.Empty;
    }
}
