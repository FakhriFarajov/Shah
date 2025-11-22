using Microsoft.AspNetCore.Mvc;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using System.Threading.Tasks;

namespace ShahAdminFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly IStatsService _statsService;
        public StatsController(IStatsService statsService)
        {
            _statsService = statsService;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview([FromQuery] int latestCount = 5)
        {
            var stats = await _statsService.GetWebsiteStatsAsync(latestCount);
            return Ok(stats);
        }
    }
}

