using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using ShahAuthApi.Core.DTOs.BuyerDtos.Request;
using ShahAuthApi.Core.DTOs.BuyerDtos.Response;

namespace ShahAuthApi.Application.Services.Buyer.Interfaces;

public interface IAccountService
{
    public Task<Result> RegisterBuyerAsync(BuyerRegisterRequestDTO requestDto);
    public Task ConfirmEmailAsync(ClaimsPrincipal user, string token, HttpContext context);
    public Task<Result> VerifyEmailAsync(string id);
    Task<Result> ChangePassword(ChangePasswordRequestDTO requestDto);
}