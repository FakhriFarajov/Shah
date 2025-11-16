using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Core.Enums;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces;

public interface IAdminOrderService
{
    Task<PaginatedResult<object>> GetOrdersForSellerAsync(string sellerProfileId, int page, int pageSize);
    Task<PaginatedResult<object>> GetDetailedOrdersForSellerAsync(string sellerProfileId, int page, int pageSize);
    
    // Admin-wide: list all orders, optional seller filter, detailed or summary
    Task<PaginatedResult<object>> GetOrdersAsync(int page, int pageSize, bool detailed = true, string? sellerProfileId = null);
    
    // Single order operations
    Task<TypedResult<object>> GetOrderByIdForSellerAsync(string orderId, string sellerProfileId);
    // Admin-wide: get order by id without seller check
    Task<TypedResult<object>> GetOrderByIdAsync(string orderId);
    
    // New: create a WarehouseOrder and link to the order
    Task<TypedResult<object>> SendOrderToWarehouseAsync(string orderId, string sellerProfileId, string warehouseId);

    // Update a single OrderItem status with ownership checks
    Task<TypedResult<object>> UpdateOrderItemStatusAsync(string orderItemId, OrderStatus newStatus);
    
}