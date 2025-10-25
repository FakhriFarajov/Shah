using ShahAuthApi.Core.DTOs.BuyerDtos.Response;
using ShahAuthApi.Core.DTOs.SellerDtos.Request;

namespace ShahAuthApi.Application.Services.Seller.Interfaces;

public interface IAuthService
{
    public Task<TypedResult<object>> LoginAsync(SellerLoginRequestDTO request);
    public Task<TypedResult<object>> LogoutAsync(string token);
    public Task<TypedResult<object>> RefreshTokenAsync(RefreshRequest request);



}