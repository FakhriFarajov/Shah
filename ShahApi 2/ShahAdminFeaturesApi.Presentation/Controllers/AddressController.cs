using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        

        [Authorize(Policy = "AdminPolicy")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAddressByIdAsync(string id) 
            => Ok(await _addressService.GetAddressByIdAsync(id));
        
        [Authorize(Policy = "AdminPolicy")]
        [HttpPost("Add")]
        public async Task<IActionResult> AddAddressAsync(AddAddressRequestDTO request)
            => Ok(await _addressService.AddAddressAsync(request));
        
        
        [Authorize(Policy = "AdminPolicy")]
        [HttpPut("Edit")]
        public async Task<IActionResult> EditAddressAsync(EditAddressRequestDTO request)
            => Ok(await _addressService.EditAddressAsync(request));
        
        
        [Authorize(Policy = "AdminPolicy")]
        [HttpDelete("Remove/{id}")]
        public async Task<IActionResult> DeleteAddressAsync(string id)
            => Ok(await _addressService.DeleteAddressAsync(id));
    }
}
