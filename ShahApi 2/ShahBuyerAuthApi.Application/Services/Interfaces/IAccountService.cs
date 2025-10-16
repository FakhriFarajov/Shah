using System.Security.Claims;
using ShahBuyerAuthApi.Contracts.DTOs.Request;
using ShahBuyerAuthApi.Contracts.DTOs.Response;
using Microsoft.AspNetCore.Http;

namespace ShahBuyerAuthApi.Application.Services.Interfaces;

public interface IAccountService
{
    public Task<Result> RegisterBuyerAsync(BuyerRegisterRequestDTO requestDto);
    public Task ConfirmEmailAsync(ClaimsPrincipal user, string token, HttpContext context);
    public Task<Result> VerifyEmailAsync(string id);
    Task<Result> ForgotPasswordAsync(ForgotPasswordRequestDTO requestDto);
}