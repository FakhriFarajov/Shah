using ShahSellerFeaturesApi.Core.DTOs.Request;
using ShahSellerFeaturesApi.Core.DTOs.Response;

namespace ShahSellerFeaturesApi.Application.Services.Interfaces;
public interface ISellerService
{
    public Task<string> GetIdByEmailAsync(string email);
    public Task<TypedResult<object>> GetSellerByIdAsync(string buyerId);
    public Task<Result> EditSellerAsync(string buyerId, EditSellerRequestDTO dto);
    
}