using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Authorize(Policy = "AdminPolicy")]
    [Route("api/[controller]")]
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;

        public SellerController(ISellerService sellerService)
        {
            _sellerService = sellerService;
        }
        
        [HttpGet("getAll")]
        public async Task<IActionResult> GetAllSellersAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 5)
            => Ok(await _sellerService.GetAllSellersAsync(pageNumber, pageSize));
        
        [HttpGet("getProfile/{sellerId}")]
        public async Task<IActionResult> GetSellerProfileByIdAsync([FromRoute] string sellerId)
            => Ok(await _sellerService.GetSellerByIdAsync(sellerId));
        
        [HttpPut("editProfile/{sellerId}")]
        public async Task<IActionResult> EditSellerProfileAsync([FromRoute] string sellerId, [FromBody] EditSellerRequestDTO dto)
        => Ok(await _sellerService.EditSellerAsync(sellerId, dto));

        [HttpDelete("deleteProfile/{sellerId}")]
        public async Task<IActionResult> DeleteSellerAsync([FromRoute] string sellerId)
            => Ok(await _sellerService.DeleteSellerAsync(sellerId));
    }
}
