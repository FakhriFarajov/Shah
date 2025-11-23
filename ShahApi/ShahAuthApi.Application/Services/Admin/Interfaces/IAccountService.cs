using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using ShahAuthApi.Core.DTOs.AdminDtos.Request;
using ShahAuthApi.Core.DTOs.AdminDtos.Response;


namespace ShahAuthApi.Application.Services.Admin.Interfaces;

public interface IAccountService
{
    public Task<Result> RegisterAdminAsync(AdminRegisterRequestDTO request);
}