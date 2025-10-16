using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Request;

namespace ShahBuyerFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AddressController : ControllerBase
    {
        private readonly IAddressService _addressService;

        public AddressController(IAddressService addressService)
        {
            _addressService = addressService;
        }
        
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAddressByIdAsync(string id) 
            => Ok(await _addressService.GetAddressByIdAsync(id));
        
        [Authorize]
        [HttpGet("Buyer/{buyerId}")]
        public async Task<IActionResult> GetBuyerAddressAsync(string buyerId) 
            => Ok(await _addressService.GetBuyerAddressAsync(buyerId));

        [Authorize]
        [HttpPost("Add")]
        public async Task<IActionResult> AddAddressAsync(AddAddressRequestDTO request)
            => Ok(await _addressService.AddAddressAsync(request));
        
        [Authorize]
        [HttpPut("Edit")]
        public async Task<IActionResult> EditAddressAsync(EditAddressRequestDTO request)
            => Ok(await _addressService.EditAddressAsync(request));
        
        [Authorize]
        [HttpDelete("Remove/{id}")]
        public async Task<IActionResult> DeleteAddressAsync(string id)
            => Ok(await _addressService.DeleteAddressAsync(id));
    }
}
