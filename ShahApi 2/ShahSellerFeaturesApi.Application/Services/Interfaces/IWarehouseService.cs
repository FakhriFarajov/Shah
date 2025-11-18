using ShahSellerFeaturesApi.Core.DTOs.Response;
using System.Collections.Generic;

namespace ShahSellerFeaturesApi.Application.Services.Interfaces;

public interface IWarehouseService
{
    Task<TypedResult<object>> GetWarehouseByIdAsync(string warehouseId);
    Task<PaginatedResult<object>> GetAllWarehousesAsync(int pageNumber, int pageSize);
    
    // New: Orders and items
    Task<PaginatedResult<object>> GetOrdersForWarehouseAsync(string warehouseId, int pageNumber = 1, int pageSize = 15);
    Task<TypedResult<object>> GetWarehouseOrderItemsAsync(string warehouseId, string orderId);
    
    // Return typed result with order items after assignment
    Task<TypedResult<object>> AssignOrderItemsToWarehouseAsync(string warehouseId, string orderId);

    // New: Assign specific order item ids
    Task<TypedResult<object>> AssignSpecificOrderItemsToWarehouseAsync(string warehouseId, string orderId, IList<string> orderItemIds);
}
