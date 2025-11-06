using ShahSellerFeaturesApi.Core.DTOs.Response;
using ShahSellerFeaturesApi.Core.DTOs.Request;

namespace ShahSellerFeaturesApi.Application.Services.Interfaces;

public interface IProductService
{
    Task<TypedResult<object>> AddProductAsync(CreateProductRequestDTO request);
    Task<TypedResult<object>> GetProductDetailsByIdAsync(string productId);
    Task<PaginatedResult<object>> GetAllPaginatedProductAsync(string? storeId= null,int page = 1, int pageSize = 5, string? categoryId = null, bool includeChildCategories = true);
    Task<TypedResult<List<object>>> GetRandomProductsAsync(int count = 45);
    
    // New: returns everything needed for editing (full payload)
    Task<TypedResult<object>> GetProductEditPayloadAsync(string productId);
    
    // Edit and delete
    Task<TypedResult<object>> EditProductAsync(string productId, EditProductRequestDTO request, string sellerProfileId);
    Task<Result> DeleteProductAsync(string productId, string sellerProfileId);

    // Sync product
    Task<TypedResult<object>> SyncProductAsync(string productId, SyncProductRequestDTO request, string sellerProfileId);
}
