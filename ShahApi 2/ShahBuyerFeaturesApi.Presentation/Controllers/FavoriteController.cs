using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;

namespace ShahBuyerFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoriteController : ControllerBase
    {
        private readonly IFavoriteService _favoriteService;
        public FavoriteController(IFavoriteService favoriteService)
        {
            _favoriteService = favoriteService;
        }
        
        
        [Authorize]
        [HttpPost("add")]
        public async Task<IActionResult> AddToFavorites([FromQuery] string buyerId, [FromQuery] string productId)
        {
            await _favoriteService.AddToFavorites(buyerId, productId);
            return Ok();
        }
        [Authorize]

        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveFromFavorites([FromQuery] string buyerId, [FromQuery] string productId)
        {
            await _favoriteService.RemoveFromFavorites(buyerId, productId);
            return Ok();
        }

        [Authorize]
        [HttpGet("is-favorite")]
        public async Task<IActionResult> IsFavorite([FromQuery] string buyerId, [FromQuery] string productId)
        {
            var result = await _favoriteService.IsFavorite(buyerId, productId);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllFavorites([FromQuery] string buyerId)
        {
            var result = await _favoriteService.GetAllFavorites(buyerId);
            return Ok(result);
        }
    }
}

