using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Core.Enums;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces
{
    public interface IOrderService
    {
        Task<TypedResult<object>> GetOrderByIdAsync(string orderId, string buyerProfileId);
        Task<TypedResult<object>> GetOrdersForBuyerAsync(string buyerProfileId);
        // New: detailed orders (with items) for buyer
    }
}
