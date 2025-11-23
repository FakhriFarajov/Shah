using Microsoft.AspNetCore.Mvc;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Request;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace ShahBuyerFeaturesApi.Presentation.Controllers
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


        [HttpGet("product-details/{productId}")]
        public async Task<IActionResult> GetProductDetailsById(string productId)
        {
            var claimUserId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;

            var result = await _productService.GetProductDetailsByIdAsync(productId, claimUserId);
            return Ok(result);
        }
        
        [HttpPost("filter")]
        public async Task<IActionResult> FilterProducts([FromBody] ProductFilterRequestDTO? request)
        {
            
            if (request is null)
                return BadRequest("Request body is required");
            var result = await _productService.GetAllPaginatedProductsFilteredAsync(request!);
            return Ok(result);
        }
        
        [HttpGet("Random")]
        public async Task<IActionResult> GetRandomProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 45,
            [FromQuery] int? count = null,
            [FromQuery] string? userId = null
            )
        {
            // Backward compatibility: if 'count' is provided, use it as pageSize
            if (count.HasValue && count.Value > 0)
            {
                pageSize = count.Value;
            }
            userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            
            // Prefer identity user id claim when available
            var result = await _productService.GetRandomProductsAsync(page, pageSize, userId);
             return Ok(result);
         }

        // POST api/product/{productId}/variant/by-attributes
        [HttpPost("{productId}/variant/by-attributes")]
        public async Task<IActionResult> GetVariantByAttributes(string productId, [FromBody] List<string> attributeValueIds)
        {
            if (string.IsNullOrWhiteSpace(productId))
                return BadRequest("productId is required");
            if (attributeValueIds == null || attributeValueIds.Count == 0)
                return BadRequest("attributeValueIds are required");

            var claimUserId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var result = await _productService.GetVariantByAttributesAsync(productId, attributeValueIds, claimUserId);
            return Ok(result);
        }
        
        [HttpGet("search-by-title")]
        public async Task<IActionResult> SearchProductsByTitle([FromQuery] string title, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (string.IsNullOrWhiteSpace(title))
                return BadRequest("Product title is required");
            var claimUserId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var result = await _productService.SearchProductsByTitleAsync(title, page, pageSize, claimUserId);
            return Ok(result);
        }
    }
}
