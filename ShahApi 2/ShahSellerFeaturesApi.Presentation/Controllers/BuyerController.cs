using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using ShahSellerFeaturesApi.Core.DTOs.Request;

namespace ShahSellerFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BuyerController : ControllerBase
    {
        private readonly ISellerService _sellerService;

        public BuyerController(ISellerService sellerService)
        {
            _sellerService = sellerService;
        }
        
        [Authorize(Policy = "SellerPolicy")]
        [HttpGet("getProfile/{sellerId}")]
        public async Task<IActionResult> GetSellerProfileByIdAsync(string sellerId)
            => Ok(await _sellerService.GetSellerByIdAsync(sellerId));
        
        [Authorize(Policy = "SellerPolicy")]
        [HttpPut("editProfile/{sellerId}")]
        public async Task<IActionResult> EditSellerProfileAsync(string sellerId, [FromBody] EditSellerRequestDTO dto)
        => Ok(await _sellerService.EditSellerAsync(sellerId, dto));
        
    }
}
