using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ShahSellerFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Authorize(Policy = "SellerPolicy")]
    [Route("api/[controller]")]
    public class SellerStatsController : ControllerBase
    {
        private readonly ISellerStatsService _sellerStatsService;
        public SellerStatsController(ISellerStatsService sellerStatsService)
        {
            _sellerStatsService = sellerStatsService;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview([FromQuery] int latestCount = 5)
        {
            // Get sellerId from JWT claims (NameIdentifier)
                var sellerProfileId = User?.Claims?.FirstOrDefault(c => c.Type == "seller_profile_id")?.Value;
            if (string.IsNullOrEmpty(sellerProfileId))
                return Unauthorized("Seller not authenticated");

            var stats = await _sellerStatsService.GetSellerStatsAsync(sellerProfileId, latestCount);
            return Ok(stats);
        }
    }
}

