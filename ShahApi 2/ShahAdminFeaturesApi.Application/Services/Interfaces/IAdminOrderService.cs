using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces;

public interface IAdminOrderService
{
    Task<PaginatedResult<object>> GetOrdersAsync(int page, int pageSize, bool detailed);
    Task<TypedResult<object>> GetOrderByIdAsync(string orderId);
}