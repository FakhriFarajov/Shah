using ShahBuyerFeaturesApi.Core.DTOs.Response;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces;

public interface IProductService
{
    Task<PaginatedResult<object>> GetRandomProductsAsync(int page = 1, int pageSize = 45);
    
    Task<PaginatedResult<object>> GetAllPaginatedProductAsync(string? storeId= null,int page = 1, int pageSize = 5, string? categoryId = null, bool includeChildCategories = true);
}
