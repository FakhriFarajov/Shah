using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces;

public interface IProductService
{
    Task<TypedResult<object>> GetProductDetailsByIdAsync(string productId);
    
    Task<PaginatedResult<object>> GetAllPaginatedProductAsync(string? storeId= null,int page = 1, int pageSize = 5, string? categoryId = null, bool includeChildCategories = true);
    // Admin CRUD and sync
    Task<Result> DeleteProductAsync(string productId);
    Task<TypedResult<object>> GetDetails(string productId);
    Task<TypedResult<object>> SyncProductAsync(string productId, AdminSyncProductRequestDTO request);
    // Statistics
    Task<TypedResult<object>> GetProductStatisticsAsync(string productId, string? productVariantId = null);
}