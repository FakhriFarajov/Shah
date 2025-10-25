using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using ShahSellerFeaturesApi.Core.DTOs.Request;

namespace ShahSellerFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;

        public SellerController(ISellerService sellerService)
        {
            _sellerService = sellerService;
        }
        
        
        [Authorize(Policy = "SellerPolicy")]
        [HttpGet("getIdByEmail/{email}")]
        public async Task<IActionResult> GetIdByEmailAsync([FromRoute] string email)
            => Ok(await _sellerService.GetIdByEmailAsync(email));
        
        
        [Authorize(Policy = "SellerPolicy")]
        [HttpGet("getProfile/{sellerId}")]
        public async Task<IActionResult> GetSellerProfileByIdAsync([FromRoute] string sellerId)
            => Ok(await _sellerService.GetSellerByIdAsync(sellerId));
        
        [Authorize(Policy = "SellerPolicy")]
        [HttpPut("editProfile/{sellerId}")]
        public async Task<IActionResult> EditSellerProfileAsync([FromRoute] string sellerId, [FromBody] EditSellerRequestDTO dto)
        => Ok(await _sellerService.EditSellerAsync(sellerId, dto));
        
    }
}
