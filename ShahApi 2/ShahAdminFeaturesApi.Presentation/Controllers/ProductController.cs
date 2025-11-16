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

        // Create product
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] AdminCreateProductRequestDTO request)
        {
            var result = await _productService.CreateProductAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        // Edit product
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> Edit([FromRoute] string id, [FromBody] AdminEditProductRequestDTO request)
        {
            var result = await _productService.EditProductAsync(id, request);
            return StatusCode(result.StatusCode, result);
        }

        // Delete product
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

        
        // List products with optional seller filter and details
        [HttpGet("allPaginated")]
        public async Task<IActionResult> GetProducts(
            [FromQuery] string? storeId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sellerId = null,
            [FromQuery] bool detailed = false)
        {
            var result = await _productService.GetAllPaginatedProductAsync(storeId ,page, pageSize, sellerId, detailed);
            return Ok(result);
        }

        // List products by seller
        [HttpGet("by-seller/{sellerId}")]
        public async Task<IActionResult> GetProductsBySeller(
            [FromQuery] string? storeId = null,
            [FromQuery] string sellerId = null!,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery]  bool detailed = false)
        {
            var result = await _productService.GetAllPaginatedProductAsync(storeId,page, pageSize, sellerId, detailed);
            return Ok(result);
        }

        // Get edit payload
        [HttpGet("{id}/edit-payload")]
        public async Task<IActionResult> GetEditPayload([FromRoute] string id)
        {
            var result = await _productService.GetProductEditPayloadAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        // Sync product (overwrite variants to match request)
        [HttpPut("{id}/sync")]
        public async Task<IActionResult> Sync([FromRoute] string id, [FromBody] AdminSyncProductRequestDTO request)
        {
            var result = await _productService.SyncProductAsync(id, request);
            return StatusCode(result.StatusCode, result);
        }

        // Statistics
        [HttpGet("{id}/statistics")]
        public async Task<IActionResult> GetStatistics([FromRoute] string id, [FromQuery] string? productVariantId = null)
        {
            var result = await _productService.GetProductStatisticsAsync(id, productVariantId);
            return StatusCode(result.StatusCode, result);
        }
    }
}
