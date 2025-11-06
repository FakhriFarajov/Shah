using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Request;

namespace ShahBuyerFeaturesApi.Presentation.Controllers
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
        
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderPaymentByIdAsync(string id) 
            => Ok(await _orderPaymentService.GetOrderPaymentByIdAsync(id));
        
        [Authorize]
        [HttpGet("Buyer/{buyerId}")]
        public async Task<IActionResult> GetBuyerOrderPaymentsAsync(string buyerId) 
            => Ok(await _orderPaymentService.GetBuyerOrderPaymentsAsync(buyerId));

        [Authorize]
        [HttpPost("Upsert")]
        public async Task<IActionResult> UpsertOrderPaymentAsync(UpsertOrderPaymentRequestDTO request)
            => Ok(await _orderPaymentService.UpsertOrderPaymentAsync(request));
        
        [Authorize]
        [HttpDelete("Remove/{id}")]
        public async Task<IActionResult> DeleteOrderPaymentAsync(string id)
            => Ok(await _orderPaymentService.DeleteOrderPaymentAsync(id));
    }
}

