using Microsoft.AspNetCore.Mvc;
using ShahBuyerAuthApi.Contracts.DTOs.Request;
using ShahBuyerAuthApi.Data.Enums;
using ShahBuyerAuthApi.Data.Models;
using ShahBuyerAuthApi.Infrastructure.Contexts;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ShahBuyerAuthApi.Application.Services.Interfaces;
using ShahBuyerAuthApi.Contracts.DTOs.Response;

namespace ShahBuyerAuthApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AddressController : ControllerBase
    {
        private readonly ShahDbContext _context;
        private readonly IMapper _mapper;
        private readonly IAddressService _addressService;

        public AddressController(ShahDbContext context, IMapper mapper, IAddressService addressService)
        {
            _context = context;
            _mapper = mapper;
            _addressService = addressService;
        }
        
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAddressByIdAsync(string id) 
            => Ok(await _addressService.GetAddressByIdAsync(id));
        
        [HttpGet("Buyer/{buyerId}")]
        public async Task<IActionResult> GetBuyerAddressAsync(string buyerId) 
            => Ok(await _addressService.GetBuyerAddressAsync(buyerId));
        

        [HttpPost("Upsert")]
        public async Task<IActionResult> UpsertAddressAsync(UpsertAddressRequestDTO request)
            => Ok(await _addressService.UpsertAddressAsync(request));
    
        [HttpDelete("Remove/{id}")]
        public async Task<IActionResult> DeleteAddressAsync(string id)
            => Ok(await _addressService.DeleteAddressAsync(id));
    }
}

