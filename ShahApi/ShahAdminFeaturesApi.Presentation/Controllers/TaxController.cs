using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAdminFeaturesApi.Application.Services.Classes;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace  ShahAdminFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Authorize(Policy = "AdminPolicy")]
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
