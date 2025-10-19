using ShahAuthApi.Core.DTOs.BuyerDtos.Request;
using ShahAuthApi.Core.DTOs.BuyerDtos.Response;

namespace ShahAuthApi.Application.Services.Buyer.Interfaces;

public interface IAuthService
{
    public Task<TypedResult<object>> LoginAsync(BuyerLoginRequestDTO request);
    public Task<TypedResult<object>> LogoutAsync(string token);
    public Task BlacklistTokenAsync(string token, DateTime expiry);
    public Task<TypedResult<object>> RefreshTokenAsync(string refreshToken);
}