using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IAdminOrderService _sellerOrderService;

    public OrdersController(IAdminOrderService sellerOrderService)
    {
        _sellerOrderService = sellerOrderService;
    }

    // GET api/orders?detailed=true&page=1&pageSize=20&sellerProfileId=optional
    [HttpGet("getAll")]
    public async Task<IActionResult> GetOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] bool detailed = true,
        [FromQuery] string? sellerProfileId = null)
    {
        var result = await _sellerOrderService.GetOrdersAsync(page, pageSize, detailed, sellerProfileId);
        return StatusCode(result.StatusCode, result);
    }
    
    [HttpGet("byOrderId/{id}")]
    public async Task<IActionResult> GetOrderById(string id)
    {
        var result = await _sellerOrderService.GetOrderByIdAsync(id);
        return StatusCode(result.StatusCode, result);
    }

    // POST api/orders/{id}/send-to-warehouse
    [HttpPost("{id}/send-to-warehouse")]
    public async Task<IActionResult> SendToWarehouse(string id, [FromBody] WarehouseSendRequestDto request)
    {
        var sellerProfileId = User?.Claims?.FirstOrDefault(c => c.Type == "seller_profile_id")?.Value;
        if (string.IsNullOrWhiteSpace(sellerProfileId))
            return BadRequest("Seller profile not found in token.");
        if (request == null || string.IsNullOrWhiteSpace(request.WarehouseId))
            return BadRequest("warehouseId is required");

        var result = await _sellerOrderService.SendOrderToWarehouseAsync(id, sellerProfileId, request.WarehouseId);
        return StatusCode(result.StatusCode, result);
    }

    // PUT api/orders/items/{orderItemId}/status
    [HttpPut("items/{orderItemId}/status")]
    public async Task<IActionResult> UpdateItemStatus(string orderItemId, [FromBody] OrderStatusDto status)
    {
        var result = await _sellerOrderService.UpdateOrderItemStatusAsync(orderItemId, status.Status);
        return StatusCode(result.StatusCode, result);
    }
}
