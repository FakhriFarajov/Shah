namespace ShahAdminFeaturesApi.Application.Services.Interfaces;

public interface IProductService
{
    Task<TypedResult<object>> GetProductDetailsByIdAsync(string productId);
    
    Task<TypedResult<List<object>>> GetRandomProductsAsync(int count = 45);
}
