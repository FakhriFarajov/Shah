using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Request;

namespace ShahBuyerFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Authorize(Policy = "BuyerPolicy")]
    [Route("api/[controller]")]
    public class FavoriteController : ControllerBase
    {
        private readonly IFavoriteService _favoriteService;
        public FavoriteController(IFavoriteService favoriteService)
        {
            _favoriteService = favoriteService;
        }
        
        
        [HttpPost("add")]
        public async Task<IActionResult> AddToFavorites([FromBody] AddFavoriteRequestDTO request)
        {
            // Prefer an explicit buyerUserId supplied by the client; fallback to the authenticated identity claim 'id'.
            var claimUserId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var effectivebuyerUserId = claimUserId;

            if (string.IsNullOrWhiteSpace(effectivebuyerUserId))
            {
                return BadRequest("Buyer id (identity user id) is required.");
            }

            await _favoriteService.AddToFavorites(effectivebuyerUserId!, request.ProductVariantId);
            return Ok();
        }
        
        
        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveFromFavorites([FromBody] RemoveFavoriteRequestDTO request)
        {
            // Prefer explicit query param buyerUserId when provided; fallback to the authenticated identity claim 'id'.
            var claimUserId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var effectivebuyerUserId = claimUserId;

            if (string.IsNullOrWhiteSpace(effectivebuyerUserId)) return BadRequest("Buyer id (identity user id) is required.");

            await _favoriteService.RemoveFromFavorites(effectivebuyerUserId!, request.ProductVariantId);
            return Ok();
        }
        
        
        [HttpGet("all")]
        public async Task<IActionResult> GetAllFavorites()
        {
            var claimUserId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var effectivebuyerUserId = claimUserId;

            if (string.IsNullOrWhiteSpace(effectivebuyerUserId)) return BadRequest("Buyer id (identity user id) is required.");

            var result = await _favoriteService.GetAllFavorites(effectivebuyerUserId!);
            return Ok(result);
        }
    }
}
