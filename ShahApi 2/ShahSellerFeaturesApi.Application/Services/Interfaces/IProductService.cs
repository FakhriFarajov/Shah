using ShahSellerFeaturesApi.Core.DTOs.Response;

namespace ShahSellerFeaturesApi.Application.Services.Interfaces;

public interface IProductService
{
    
    Task<TypedResult<List<object>>> GetRandomProductsAsync(int count = 45);
}
