using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahBuyerFeaturesApi.Application.Utils.GetChain;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;
using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Presentation.Controllers
{
    [ApiController]

    [Route("api/[controller]")]
    public class CountryController : ControllerBase
    {
        private readonly ShahDbContext _context;
        private readonly CountryCodeService _countryCodeService;
        public CountryController(ShahDbContext context, CountryCodeService countryCodeService)
        {
            _context = context;
            _countryCodeService = countryCodeService;
        }
        
        [HttpGet("all")]
        public async Task<IActionResult> GetAllCountryCodesAsync()
        {
            try
            {
                var result = await _countryCodeService.GetAllCountryCodesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.InnerException?.Message ?? ex.Message });
            }
        }
    }
}
