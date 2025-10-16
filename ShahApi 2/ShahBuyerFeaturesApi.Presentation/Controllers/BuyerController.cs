using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Request;

namespace ShahBuyerAuthApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BuyerController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IBuyerService _buyerService;

        public BuyerController(IMapper mapper, IBuyerService buyerService)
        {
            _mapper = mapper;
            _buyerService = buyerService;
        }
        
        [Authorize]
        [HttpGet("getProfile/{buyerId}")]
        public async Task<IActionResult> GetBuyerProfileByIdAsync(string buyerId)
            => Ok(await _buyerService.GetBuyerByIdAsync(buyerId));
        
        [Authorize]
        [HttpPut("editProfile/{buyerId}")]
        public async Task<IActionResult> EditBuyerProfileAsync(string buyerId, [FromBody] EditBuyerRequestDTO dto)
        {
            return Ok(await _buyerService.EditBuyerAsync(buyerId, dto));
        }
    }
}
