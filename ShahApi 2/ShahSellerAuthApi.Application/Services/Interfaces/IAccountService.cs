using System.Security.Claims;
using ShahSellerAuthApi.Contracts.DTOs.Request;
using ShahSellerAuthApi.Contracts.DTOs.Response;
using Microsoft.AspNetCore.Http;

namespace ShahSellerAuthApi.Application.Services.Interfaces;

public interface IAccountService
{
    public Task<Result> RegisterBuyerAsync(SellerRegisterRequestDTO requestDto);
    public Task ConfirmEmailAsync(ClaimsPrincipal user, string token, HttpContext context);
    public Task<Result> VerifyEmailAsync(string id);
    Task<Result> ForgotPasswordAsync(string email, string newPassword, string OldPassword);
}