using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahSellerFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WarehouseController : ControllerBase
    {
        private readonly IWarehouseService _warehouseService;

        public WarehouseController(IWarehouseService warehouseService)
        {
            _warehouseService = warehouseService;
        }

        [HttpGet("getById{warehouseId}")]
        public async Task<IActionResult> GetById(string warehouseId)
        {
            var result = await _warehouseService.GetWarehouseByIdAsync(warehouseId);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("getAllPaginated")]
        public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 5)
        {
            var result = await _warehouseService.GetAllWarehousesAsync(pageNumber, pageSize);
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateWarehouseRequestDTO dto)
        {
            var result = await _warehouseService.CreateWarehouseAsync(dto);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("update/{warehouseId}")]
        public async Task<IActionResult> Update(string warehouseId, [FromBody] UpdateWarehouseRequestDTO dto)
        {
            var result = await _warehouseService.UpdateWarehouseAsync(warehouseId, dto);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("delete/{warehouseId}")]
        public async Task<IActionResult> Delete(string warehouseId)
        {
            var result = await _warehouseService.DeleteWarehouseAsync(warehouseId);
            return StatusCode(result.StatusCode, result);
        }

        // New: Get orders for a warehouse (paginated)
        [HttpGet("orders/{warehouseId}")]
        public async Task<IActionResult> GetWarehouseOrders(string warehouseId, [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 5)
        {
            var result = await _warehouseService.GetOrdersForWarehouseAsync(warehouseId, pageNumber, pageSize);
            return Ok(result);
        }

        // New: Get items of a specific order that belongs to a warehouse
        [HttpGet("{warehouseId}/orders/{orderId}/items")]
        public async Task<IActionResult> GetWarehouseOrderItems(string warehouseId, string orderId)
        {
            var result = await _warehouseService.GetWarehouseOrderItemsAsync(warehouseId, orderId);
            return StatusCode(result.StatusCode, result);
        }
        
        [HttpPost("{warehouseId}/assignOrderItems/{orderId}")]
        public async Task<IActionResult> AssignOrderItems(string warehouseId, string orderId,
            [FromBody] AssignOrderItemsRequest request)
        {
            var result =
                await _warehouseService.AssignOrderItemsToWarehouseAsync(warehouseId, orderId,
                    request.OrderItemIds);
            return StatusCode(result.StatusCode, result);
        }
    }
}
