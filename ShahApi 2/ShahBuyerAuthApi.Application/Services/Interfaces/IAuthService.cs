using ShahBuyerAuthApi.Contracts.DTOs.Request;
using ShahBuyerAuthApi.Contracts.DTOs.Response;

namespace ShahBuyerAuthApi.Application.Services.Interfaces;

public interface IAuthService
{
    public Task<TypedResult<object>> LoginAsync(BuyerLoginRequestDTO request);
    public Task<TypedResult<object>> LogoutAsync(string token);
    
    public Task<TypedResult<object>> RefreshTokenAsync(string token);
}