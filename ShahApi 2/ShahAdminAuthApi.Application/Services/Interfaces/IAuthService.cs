using ShahAdminAuthApi.Contracts.DTOs.Request;
using ShahAdminAuthApi.Contracts.DTOs.Response;

namespace ShahAdminAuthApi.Application.Services.Interfaces;

public interface IAuthService
{
    public Task<TypedResult<object>> LoginAsync(AdminLoginRequestDTO request);
    public Task<TypedResult<object>> LogoutAsync(string token);
}