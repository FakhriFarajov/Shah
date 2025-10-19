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
    public class CountriesController : ControllerBase
    {
        private readonly ShahDbContext _context;
        private readonly CountryCodeService _countryCodeService;
        public CountriesController(ShahDbContext context, CountryCodeService countryCodeService)
        {
            _context = context;
            _countryCodeService = countryCodeService;
        }
        
        [HttpGet("all")]
        public async Task<IActionResult> GetAllCountryCodesAsync() 
            => Ok(await _countryCodeService.GetAllCountryCodesAsync());
    }
}

