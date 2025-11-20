using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces;

public interface IWarehouseService
{
    Task<TypedResult<object>> GetWarehouseByIdAsync(string warehouseId);
    Task<PaginatedResult<object>> GetAllWarehousesAsync(int pageNumber, int pageSize);
    Task<TypedResult<object>> CreateWarehouseAsync(CreateWarehouseRequestDTO dto);
    Task<TypedResult<object>> UpdateWarehouseAsync(string warehouseId, UpdateWarehouseRequestDTO dto);
    Task<Result> DeleteWarehouseAsync(string warehouseId);
    
    // New: Orders and items
    Task<PaginatedResult<object>> GetOrdersForWarehouseAsync(string warehouseId, int pageNumber = 1, int pageSize = 15);
    Task<TypedResult<object>> GetWarehouseOrderItemsAsync(string warehouseId, string orderId);
    
    Task<TypedResult<object>> AssignOrderItemsToWarehouseAsync(string warehouseId, string orderId);
    
    // New: Assign specific order item ids
    Task<TypedResult<object>> AssignSpecificOrderItemsToWarehouseAsync(string warehouseId, string orderId, IList<string> orderItemIds);
}

