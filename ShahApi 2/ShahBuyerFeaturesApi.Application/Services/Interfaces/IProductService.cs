using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Core.DTOs.Request;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces;

public interface IProductService
{
    Task<PaginatedResult<object>> GetRandomProductsAsync(int page = 1, int pageSize = 20, string? userId = null);
    Task<PaginatedResult<object>> GetAllPaginatedProductsFilteredAsync(ProductFilterRequestDTO request);
    Task<TypedResult<object>> GetProductDetailsByIdAsync(string productId, string? userId = null);
    Task<TypedResult<object>> GetVariantByAttributesAsync(string productId, List<string> attributeValueIds, string? userId = null);
}
