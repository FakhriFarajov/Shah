using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using ShahSellerFeaturesApi.Core.DTOs.Request;

namespace ShahSellerFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderPaymentController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IOrderPaymentService _orderPaymentService;

        public OrderPaymentController(IMapper mapper, IOrderPaymentService orderPaymentService)
        {
            _mapper = mapper;
            _orderPaymentService = orderPaymentService;
        }
        
        [Authorize(Policy = "SellerPolicy")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderPaymentByIdAsync(string id) 
            => Ok(await _orderPaymentService.GetOrderPaymentByIdAsync(id));
        
        [Authorize(Policy = "SellerPolicy")]
        [HttpGet("Buyer/{sellerId}")]
        public async Task<IActionResult> GetBuyerOrderPaymentsAsync(string sellerId) 
            => Ok(await _orderPaymentService.GetBuyerOrderPaymentsAsync(sellerId));

        [Authorize(Policy = "SellerPolicy")]
        [HttpPost("Upsert")]
        public async Task<IActionResult> UpsertOrderPaymentAsync(UpsertOrderPaymentRequestDTO request)
            => Ok(await _orderPaymentService.UpsertOrderPaymentAsync(request));
        
        [Authorize(Policy = "SellerPolicy")]
        [HttpDelete("Remove/{id}")]
        public async Task<IActionResult> DeleteOrderPaymentAsync(string id)
            => Ok(await _orderPaymentService.DeleteOrderPaymentAsync(id));
    }
}

