using ShahSellerAuthApi.Contracts.DTOs.Request;
using ShahSellerAuthApi.Contracts.DTOs.Response;

namespace ShahSellerAuthApi.Application.Services.Interfaces;

public interface IAuthService
{
    public Task<TypedResult<object>> LoginAsync(SellerLoginRequestDTO request);
    public Task<TypedResult<object>> LogoutAsync(string token);
}