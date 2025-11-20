using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using ShahSellerFeaturesApi.Core.DTOs.Request;
using ShahSellerFeaturesApi.Core.Enums;

namespace ShahSellerFeaturesApi.Presentation.Controllers;

[ApiController]
[Authorize(Policy = "SellerPolicy")]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ISellerOrderService _sellerOrderService;

    public OrdersController(ISellerOrderService sellerOrderService)
    {
        _sellerOrderService = sellerOrderService;
    }

    // GET api/orders/getDetailed?page=1&pageSize=20&detailed=true
    [HttpGet("getDetailed")]
    public async Task<IActionResult> GetOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] bool detailed = true)
    {
        var sellerProfileId = User?.Claims?.FirstOrDefault(c => c.Type == "seller_profile_id")?.Value;
        if (string.IsNullOrWhiteSpace(sellerProfileId))
            return BadRequest("Seller profile not found in token.");

        var result = detailed
            ? await _sellerOrderService.GetDetailedOrdersForSellerAsync(sellerProfileId, page, pageSize)
            : await _sellerOrderService.GetOrdersForSellerAsync(sellerProfileId, page, pageSize);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("getById/{id}")]
    public async Task<IActionResult> GetOrderById(string id)
    {
        var sellerProfileId = User?.Claims?.FirstOrDefault(c => c.Type == "seller_profile_id")?.Value;
        if (string.IsNullOrWhiteSpace(sellerProfileId))
            return BadRequest("Seller profile not found in token.");
        var result = await _sellerOrderService.GetOrderByIdForSellerAsync(id, sellerProfileId);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPut("updateStatus/{orderItemId}")]
    public async Task<IActionResult> UpdateItemStatus(string orderItemId, [FromBody] OrderStatusDto status)
    {
        var sellerProfileId = User?.Claims?.FirstOrDefault(c => c.Type == "seller_profile_id")?.Value;
        if (string.IsNullOrWhiteSpace(sellerProfileId))
            return BadRequest("Seller profile not found in token.");
        var result = await _sellerOrderService.UpdateOrderItemStatusAsync(orderItemId, sellerProfileId, status.Status);
        return StatusCode(result.StatusCode, result);
    }
}
