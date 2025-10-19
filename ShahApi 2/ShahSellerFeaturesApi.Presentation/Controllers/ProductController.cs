using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahSellerFeaturesApi.Application.Services.Interfaces;

namespace ShahSellerFeaturesApi.Presentation.Controllers
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

        

        // [Authorize(Policy = "SellerPolicy")]
        // [HttpGet("{id}")]
        // public async Task<IActionResult> GetProductDetailsById(string id)
        // {
        //     var result = await _productService.GetProductDetailsByIdAsync(id);
        //     return Ok(result);
        // }
        
        [Authorize(Policy = "SellerPolicy")]
        [HttpGet("Random")]
        public async Task<IActionResult> GetRandomProducts([FromQuery] int count = 45)
        {
            var result = await _productService.GetRandomProductsAsync(count);
            return Ok(result);
        }
    }
}
