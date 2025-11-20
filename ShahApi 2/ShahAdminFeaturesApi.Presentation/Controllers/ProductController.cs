using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }
        
        // Delete product???
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] string id)
        {
            var result = await _productService.DeleteProductAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        // Get product details by id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductDetailsById(string id)
        {
            var result = await _productService.GetProductDetailsByIdAsync(id);
            return Ok(result);
        }
        
        // List products with optional storeInfo filter and details
        [HttpGet("allPaginated")]
        public async Task<IActionResult> GetProducts(
            [FromQuery] string? storeInfoId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool detailed = false)
        {
            var result = await _productService.GetAllPaginatedProductAsync(storeInfoId, page, pageSize, null, detailed);
            return Ok(result);
        }

        // Get edit payload
        [HttpGet("getDetails/{id}")]
        public async Task<IActionResult> GetDetails([FromRoute] string id)
        {
            var result = await _productService.GetDetails(id);
            return StatusCode(result.StatusCode, result);
        }

        // Sync product (overwrite variants to match request)
        [HttpPut("sync/{id}")]
        public async Task<IActionResult> Sync([FromRoute] string id, [FromBody] AdminSyncProductRequestDTO request)
        {
            var result = await _productService.SyncProductAsync(id, request);
            return StatusCode(result.StatusCode, result);
        }

        // Statistics
        [HttpGet("stats/{id}")]
        public async Task<IActionResult> GetStatistics([FromRoute] string id, [FromQuery] string? productVariantId = null)
        {
            var result = await _productService.GetProductStatisticsAsync(id, productVariantId);
            return StatusCode(result.StatusCode, result);
        }
    }
}
