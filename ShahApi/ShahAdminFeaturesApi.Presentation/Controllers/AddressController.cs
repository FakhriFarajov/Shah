using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Authorize(Policy = "AdminPolicy")]
    [Route("api/[controller]")]
    public class AddressController : ControllerBase
    {
        private readonly IAddressService _addressService;

        public AddressController(IAddressService addressService)
        {
            _addressService = addressService;
        }
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAddressByIdAsync(string id) 
            => Ok(await _addressService.GetAddressByIdAsync(id));
        
        [HttpGet("Buyer/{buyerId}")]
        public async Task<IActionResult> GetBuyerAddressAsync(string buyerId) 
            => Ok(await _addressService.GetBuyerAddressAsync(buyerId));

        [HttpPost("Add")]
        public async Task<IActionResult> AddAddressAsync(AddAddressRequestDTO request)
            => Ok(await _addressService.AddAddressAsync(request));
        
        [HttpPut("Edit")]
        public async Task<IActionResult> EditAddressAsync(EditAddressRequestDTO request)
            => Ok(await _addressService.EditAddressAsync(request));
        
    }
}
