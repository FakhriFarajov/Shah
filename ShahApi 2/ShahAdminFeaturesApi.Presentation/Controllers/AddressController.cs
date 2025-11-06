using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers
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
        
        [Authorize(Policy = "AdminOrBuyer")] //We need to send a Bearer token in the header to access this endpoint
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAddressByIdAsync(string id) 
            => Ok(await _addressService.GetAddressByIdAsync(id));
        
        [Authorize(Policy = "AdminOrBuyer")] //We need to send a Bearer token in the header to access this endpoint
        [HttpGet("Buyer/{buyerId}")]
        public async Task<IActionResult> GetBuyerAddressAsync(string buyerId) 
            => Ok(await _addressService.GetBuyerAddressAsync(buyerId));

        [Authorize(Policy = "AdminOrBuyer")] //We need to send a Bearer token in the header to access this endpoint
        [HttpPost("Add")]
        public async Task<IActionResult> AddAddressAsync(AddAddressRequestDTO request)
            => Ok(await _addressService.AddAddressAsync(request));
        
        [Authorize(Policy = "AdminOrBuyer")] //We need to send a Bearer token in the header to access this endpoint
        [HttpPut("Edit")]
        public async Task<IActionResult> EditAddressAsync(EditAddressRequestDTO request)
            => Ok(await _addressService.EditAddressAsync(request));
        
        [Authorize(Policy = "AdminOrBuyer")] //We need to send a Bearer token in the header to access this endpoint
        [HttpDelete("Remove/{id}")]
        public async Task<IActionResult> DeleteAddressAsync(string id)
            => Ok(await _addressService.DeleteAddressAsync(id));
    }
}
