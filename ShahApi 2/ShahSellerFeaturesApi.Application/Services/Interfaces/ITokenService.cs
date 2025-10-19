using System.Security.Claims;
using ShahSellerFeaturesApi.Core.Models;

namespace ShahSellerFeaturesApi.Application.Services.Interfaces;
public interface ITokenService
{
    public Task<string> CreateTokenAsync(User Buyer);
    public Task<string> CreateEmailTokenAsync(ClaimsPrincipal Buyer);
    public Task<bool> ValidateEmailTokenAsync(string token);
    public Task<string> GetEmailFromTokenAsync(string token);
}