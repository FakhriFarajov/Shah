using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces;

public interface IOrderPaymentService
{
    Task<Result> UpsertOrderPaymentAsync(UpsertOrderPaymentRequestDTO request);
    Task<Result> DeleteOrderPaymentAsync(string orderPaymentId);
    Task<TypedResult<object>> GetOrderPaymentByIdAsync(string orderPaymentId);
    Task<TypedResult<object>> GetBuyerOrderPaymentsAsync(string buyerProfileId);
}

