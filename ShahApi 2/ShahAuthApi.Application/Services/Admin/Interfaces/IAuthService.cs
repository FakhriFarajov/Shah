using ShahAuthApi.Core.DTOs.AdminDtos.Request;
using ShahAuthApi.Core.DTOs.AdminDtos.Response;

namespace ShahAuthApi.Application.Services.Admin.Interfaces;

public interface IAuthService
{
    public Task<TypedResult<object>> LoginAsync(AdminLoginRequestDTO request);
    public Task<TypedResult<object>> LogoutAsync(string token);
    public Task<TypedResult<object>> RefreshTokenAsync(RefreshRequest request);
}