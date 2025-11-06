using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShahAuthApi.Infrastructure.Contexts;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;

namespace ShahBuyerFeaturesApi.Presentation.Controllers
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
        

        [HttpGet("allPaginated")]
        public async Task<IActionResult> GetProducts(
            [FromQuery] string storeId = null!,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] string? categoryId = null,
            [FromQuery] bool includeChildCategories = true)
        {
            if (string.IsNullOrWhiteSpace(storeId))
                return BadRequest("storeId is required");
            var result = await _productService.GetAllPaginatedProductAsync(storeId, page, pageSize, categoryId, includeChildCategories);
            return Ok(result);
        }
        
        [Authorize(Policy = "SellerPolicy")]
        [HttpGet("Random")]
        public async Task<IActionResult> GetRandomProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 45,
            [FromQuery] int? count = null)
        {
            // Backward compatibility: if 'count' is provided, use it as pageSize
            if (count.HasValue && count.Value > 0)
            {
                pageSize = count.Value;
            }
            var result = await _productService.GetRandomProductsAsync(page, pageSize);
            return Ok(result);
        }
    }
}
