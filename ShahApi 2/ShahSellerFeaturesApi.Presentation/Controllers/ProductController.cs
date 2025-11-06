using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using ShahSellerFeaturesApi.Core.DTOs.Request;
using ShahSellerFeaturesApi.Infrastructure.Contexts;

namespace ShahSellerFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ShahDbContext _db;

        public ProductController(IProductService productService, ShahDbContext db)
        {
            _productService = productService;
            _db = db;
        }

        [Authorize(Policy = "SellerPolicy")]
        [HttpPost("add")]
        public async Task<IActionResult> AddProduct([FromBody] CreateProductRequestDTO request)
        {
            if (request == null) return BadRequest("Request body is required.");

            // Auto-resolve StoreInfoId from the authenticated seller if not provided
            if (string.IsNullOrWhiteSpace(request.StoreInfoId))
            {
                var sellerProfileId = User?.Claims?.FirstOrDefault(c => c.Type == "seller_profile_id")?.Value;
                if (string.IsNullOrWhiteSpace(sellerProfileId))
                    return BadRequest("Seller profile not found in token.");

                var store = await _db.StoreInfos.FirstOrDefaultAsync(s => s.SellerProfileId == sellerProfileId);
                if (store == null)
                    return BadRequest("No store found for the authenticated seller.");

                request.StoreInfoId = store.Id;
            }

            var result = await _productService.AddProductAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [Authorize(Policy = "SellerPolicy")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductDetailsById(string id)
        {
            var result = await _productService.GetProductDetailsByIdAsync(id);
            return Ok(result);
        }

        [HttpGet("allPaginated")]
        public async Task<IActionResult> GetProducts([FromQuery] string storeId = null!, [FromQuery] int page = 1, [FromQuery] int pageSize = 5, [FromQuery] string? categoryId = null, [FromQuery] bool includeChildCategories = true)
        {
            if (string.IsNullOrWhiteSpace(storeId))
                return BadRequest("storeId is required");
            var result = await _productService.GetAllPaginatedProductAsync(storeId, page, pageSize, categoryId, includeChildCategories);
            return Ok(result);
        }
        
        [Authorize(Policy = "SellerPolicy")]
        [HttpGet("Random")]
        public async Task<IActionResult> GetRandomProducts([FromQuery] int count = 45)
        {
            var result = await _productService.GetRandomProductsAsync(count);
            return Ok(result);
        }

        [Authorize(Policy = "SellerPolicy")]
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> EditProduct(string id, [FromBody] EditProductRequestDTO request)
        {
            var sellerProfileId = User?.Claims?.FirstOrDefault(c => c.Type == "seller_profile_id")?.Value;
            if (string.IsNullOrWhiteSpace(sellerProfileId))
                return BadRequest("Seller profile not found in token.");
            var result = await _productService.EditProductAsync(id, request, sellerProfileId);
            return StatusCode(result.StatusCode, result);
        }

        [Authorize(Policy = "SellerPolicy")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(string id)
        {
            var sellerProfileId = User?.Claims?.FirstOrDefault(c => c.Type == "seller_profile_id")?.Value;
            if (string.IsNullOrWhiteSpace(sellerProfileId))
                return BadRequest("Seller profile not found in token.");
            var result = await _productService.DeleteProductAsync(id, sellerProfileId);
            return StatusCode(result.StatusCode, result);
        }

        [Authorize(Policy = "SellerPolicy")]
        [HttpGet("edit-payload/{id}")]
        public async Task<IActionResult> GetEditPayload(string id)
        {
            var sellerProfileId = User?.Claims?.FirstOrDefault(c => c.Type == "seller_profile_id")?.Value;
            if (string.IsNullOrWhiteSpace(sellerProfileId))
                return BadRequest("Seller profile not found in token.");

            var owner = await _db.Products
                .Include(p => p.StoreInfo)
                .Where(p => p.Id == id)
                .Select(p => p.StoreInfo.SellerProfileId)
                .FirstOrDefaultAsync();
            if (owner == null)
                return NotFound("Product not found");
            if (owner != sellerProfileId)
                return Forbid();

            var result = await _productService.GetProductEditPayloadAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        [Authorize(Policy = "SellerPolicy")]
        [HttpPut("sync/{id}")]
        public async Task<IActionResult> SyncProduct(string id, [FromBody] SyncProductRequestDTO request)
        {
            var sellerProfileId = User?.Claims?.FirstOrDefault(c => c.Type == "seller_profile_id")?.Value;
            if (string.IsNullOrWhiteSpace(sellerProfileId))
                return BadRequest("Seller profile not found in token.");

            var result = await _productService.SyncProductAsync(id, request, sellerProfileId);
            return StatusCode(result.StatusCode, result);
        }
    }
}
