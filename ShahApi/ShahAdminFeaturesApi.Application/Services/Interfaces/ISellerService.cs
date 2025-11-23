using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces;
public interface ISellerService
{
    public Task<string> GetIdByEmailAsync(string email);
    public Task<TypedResult<object>> GetSellerByIdAsync(string buyerId);
    public Task<Result> EditSellerAsync(string buyerId, EditSellerRequestDTO dto);
    public Task<PaginatedResult<object>> GetAllSellersAsync(int pageNumber, int pageSize);
    public Task<Result> DeleteSellerAsync(string sellerId);
    
}