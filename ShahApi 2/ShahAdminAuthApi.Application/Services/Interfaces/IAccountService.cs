using System.Security.Claims;
using ShahAdminAuthApi.Contracts.DTOs.Request;
using ShahAdminAuthApi.Contracts.DTOs.Response;
using Microsoft.AspNetCore.Http;

namespace ShahAdminAuthApi.Application.Services.Interfaces;

public interface IAccountService
{
    public Task<Result> RegisterBuyerAsync(BuyerRegisterRequestDTO requestDto);
    public Task ConfirmEmailAsync(ClaimsPrincipal user, string token, HttpContext context);
    public Task<Result> VerifyEmailAsync(string id);
    Task<Result> ForgotPasswordAsync(string email, string newPassword, string OldPassword);
}