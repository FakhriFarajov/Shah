using System.Security.Claims;
using ShahAdminAuthApi.Contracts.DTOs.Request;
using ShahAdminAuthApi.Contracts.DTOs.Response;
using Microsoft.AspNetCore.Http;

namespace ShahAdminAuthApi.Application.Services.Interfaces;

public interface IAccountService
{
    public Task<Result> RegisterAdminAsync(AdminRegisterRequestDTO requestDto);
    Task<Result> ForgotPasswordAsync(string email, string newPassword, string OldPassword);
}