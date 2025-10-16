namespace ShahAdminFeaturesApi.Application.Services.Interfaces;

public interface IOrderPaymentService
{
    Task<Result> UpsertOrderPaymentAsync(UpsertOrderPaymentRequestDTO request);
    Task<Result> DeleteOrderPaymentAsync(string orderPaymentId);
    Task<TypedResult<object>> GetOrderPaymentByIdAsync(string orderPaymentId);
    Task<TypedResult<object>> GetBuyerOrderPaymentsAsync(string buyerProfileId);
}

