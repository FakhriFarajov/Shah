using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers
{
    [ApiController]
    // [Authorize(Policy = "AdminPolicy")]
    [Route("api/[controller]")]
    public class BuyerController : ControllerBase
    {
        private readonly IBuyerService _buyerService;

        public BuyerController(IBuyerService buyerService)
        {
            _buyerService = buyerService;
        }

        [HttpGet("getAll")]
        public async Task<IActionResult> GetAllBuyersAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 5)
            => Ok(await _buyerService.GetAllBuyersAsync(pageNumber, pageSize));
        
            
        [HttpGet("getProfile/{buyerId}")]
        public async Task<IActionResult> GetBuyerProfileByIdAsync(string buyerId)
            => Ok(await _buyerService.GetBuyerByIdAsync(buyerId));
    
        [HttpPut("editProfile/{buyerId}")]
        public async Task<IActionResult> EditBuyerProfileAsync(string buyerId, [FromBody] EditBuyerRequestDTO dto)
        {
            return Ok(await _buyerService.EditBuyerAsync(buyerId, dto));
        }
        
        [HttpDelete("deleteProfile/{buyerId}")]
        public async Task<IActionResult> DeleteBuyerAsync(string buyerId)
            => Ok(await _buyerService.DeleteBuyerAsync(buyerId));
        
    }
}

