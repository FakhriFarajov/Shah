using ShahSellerFeaturesApi.Core.DTOs.Response;
using ShahSellerFeaturesApi.Core.DTOs.Request;

namespace ShahSellerFeaturesApi.Application.Services.Interfaces;

public interface IProductService
{
    Task<TypedResult<object>> AddProductAsync(CreateProductRequestDTO request);
    Task<PaginatedResult<object>> GetAllPaginatedProductAsync(string? storeId= null,int page = 1, int pageSize = 5, string? categoryId = null, bool includeChildCategories = true);
    Task<TypedResult<object>> GetDetails(string productId);
    // Edit and delete
    // Sync product
    Task<TypedResult<object>> SyncProductAsync(string productId, SyncProductRequestDTO request, string sellerProfileId);
    // Statistics
    Task<TypedResult<object>> GetProductStatisticsAsync(string productId, string sellerProfileId, string? productVariantId = null);
}
