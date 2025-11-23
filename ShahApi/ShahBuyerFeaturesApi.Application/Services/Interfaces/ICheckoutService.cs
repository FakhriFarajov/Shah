using ShahBuyerFeaturesApi.Core.DTOs.Request;
using ShahBuyerFeaturesApi.Core.DTOs.Response;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces
{
    public interface ICheckoutService
    {
        Task<TypedResult<object>> CheckoutAsync(string buyerProfileId, CheckoutRequestDto request);
    }
}
