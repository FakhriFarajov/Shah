using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahSellerFeaturesApi.Infrastructure.Contexts;
using ShahSellerFeaturesApi.Application.Services.Classes;

namespace ShahSellerFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaxController : ControllerBase
    {
        private readonly ShahDbContext _context;
        private readonly TaxService _taxesService;
        public TaxController(ShahDbContext context, TaxService taxesService)
        {
            _context = context;
            _taxesService = taxesService;
        }
        
        [HttpGet("all")]
        public async Task<IActionResult> GetAllTaxesAsync() 
            => Ok(await _taxesService.GetAllTaxesAsync());
    }
}
