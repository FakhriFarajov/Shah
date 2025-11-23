using ShahSellerFeaturesApi.Core.DTOs.Request;
using ShahSellerFeaturesApi.Core.DTOs.Response;

namespace ShahSellerFeaturesApi.Application.Services.Interfaces;

public interface IOrderPaymentService
{
    Task<Result> UpsertOrderPaymentAsync(UpsertOrderPaymentRequestDTO request);
    Task<Result> DeleteOrderPaymentAsync(string orderPaymentId);
    Task<TypedResult<object>> GetOrderPaymentByIdAsync(string orderPaymentId);
    Task<TypedResult<object>> GetBuyerOrderPaymentsAsync(string buyerProfileId);
}

