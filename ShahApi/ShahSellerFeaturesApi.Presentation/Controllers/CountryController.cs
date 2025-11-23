using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahSellerFeaturesApi.Infrastructure.Contexts;
using ShahSellerFeaturesApi.Application.Services.Classes;

namespace ShahSellerFeaturesApi.Presentation.Controllers
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
            => Ok(await _countryCodeService.GetAllCountryCodesAsync());
    }
}

