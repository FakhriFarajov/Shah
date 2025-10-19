using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using ShahAuthApi.Core.DTOs.BuyerDtos.Response;
using ShahAuthApi.Core.DTOs.SellerDtos.Request;

namespace ShahAuthApi.Application.Services.Seller.Interfaces;

public interface IAccountService
{
    public Task<Result> RegisterSellerAsync(SellerRegisterRequestDTO requestDto);
    public Task ConfirmEmailAsync(ClaimsPrincipal user, string token, HttpContext context);
    public Task<Result> VerifyEmailAsync(string id);
    Task<Result> ForgotPasswordAsync(ForgotPasswordRequestDTO requestDto);
}