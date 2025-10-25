using ShahBuyerFeaturesApi.Contracts.DTOs.Response;
using ShahBuyerFeaturesApi.Core.DTOs.Request;
using ShahBuyerFeaturesApi.Core.DTOs.Response;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces;
public interface IBuyerService
{
    public Task<string> GetIdByEmailAsync(string email);
    public Task<TypedResult<object>> GetBuyerByIdAsync(string buyerId);
    public Task<Result> EditBuyerAsync(string buyerId, EditBuyerRequestDTO dto);
    
}