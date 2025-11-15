using ShahSellerFeaturesApi.Core.DTOs.Response;
using ShahSellerFeaturesApi.Core.Enums;

namespace ShahSellerFeaturesApi.Application.Services.Interfaces;

public interface ISellerOrderService
{
    // Paginated listings
    Task<PaginatedResult<object>> GetOrdersForSellerAsync(string sellerProfileId, int page, int pageSize);
    Task<PaginatedResult<object>> GetDetailedOrdersForSellerAsync(string sellerProfileId, int page, int pageSize);
    
    // Single order operations
    Task<TypedResult<object>> GetOrderByIdForSellerAsync(string orderId, string sellerProfileId);
    
    // New: create a WarehouseOrder and link to the order
    Task<TypedResult<object>> SendOrderToWarehouseAsync(string orderId, string sellerProfileId, string warehouseId);

    // Update a single OrderItem status with ownership checks
    Task<TypedResult<object>> UpdateOrderItemStatusAsync(string orderItemId, string sellerProfileId, OrderStatus newStatus);
}
