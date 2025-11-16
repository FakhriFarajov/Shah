using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces;

public interface IProductService
{
    Task<TypedResult<object>> GetProductDetailsByIdAsync(string productId);
    
    Task<PaginatedResult<object>> GetAllPaginatedProductAsync(string? storeId= null,int page = 1, int pageSize = 5, string? categoryId = null, bool includeChildCategories = true);
    // Admin CRUD and sync
    Task<TypedResult<object>> CreateProductAsync(AdminCreateProductRequestDTO request);
    Task<TypedResult<object>> EditProductAsync(string productId, AdminEditProductRequestDTO request);
    Task<Result> DeleteProductAsync(string productId);
    Task<TypedResult<object>> GetProductEditPayloadAsync(string productId);
    Task<TypedResult<object>> SyncProductAsync(string productId, AdminSyncProductRequestDTO request);

    // Statistics
    Task<TypedResult<object>> GetProductStatisticsAsync(string productId, string? productVariantId = null);
}