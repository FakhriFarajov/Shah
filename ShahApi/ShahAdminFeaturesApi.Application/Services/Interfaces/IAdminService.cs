using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces;
public interface IAdminService
{
    Task<string> GetIdByEmailAsync(string email);
    Task<TypedResult<object>> GetAdminByIdAsync(string adminId);
    Task<PaginatedResult<object>> GetAllAdminsAsync(int pageNumber, int pageSize);
    
    Task<Result> AddAdminAsync(AddAdminRequestDTO dto);
    Task<Result> EditAdminAsync(string adminId, EditAdminRequestDTO dto);
    Task<Result> DeleteAdminAsync(string adminId);
}