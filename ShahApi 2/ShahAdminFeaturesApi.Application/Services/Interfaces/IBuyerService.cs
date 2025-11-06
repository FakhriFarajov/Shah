using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces;
public interface IBuyerService
{
    public Task<PaginatedResult<object>> GetAllBuyersAsync(int pageNumber, int pageSize);
    public Task<TypedResult<object>> GetBuyerByIdAsync(string buyerId);

    public Task<Result> EditBuyerAsync(string buyerId, EditBuyerRequestDTO dto);
    
    public Task<Result> DeleteBuyerAsync(string buyerId);
}