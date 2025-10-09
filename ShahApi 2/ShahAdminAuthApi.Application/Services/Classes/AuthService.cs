using System.Security.Authentication;
using ShahAdminAuthApi.Application.Utils;
using Microsoft.EntityFrameworkCore;
using ShahAdminAuthApi.Application.Services.Interfaces;
using ShahAdminAuthApi.Contracts.DTOs.Request;
using ShahAdminAuthApi.Contracts.DTOs.Response;
using ShahAdminAuthApi.Infrastructure.Contexts;
using static BCrypt.Net.BCrypt;

namespace ShahAdminAuthApi.Application.Services.Classes;


public class AuthService : IAuthService
{
    private readonly ShahDbContext _context;
    private readonly TokenManager _tokenService;

    public AuthService(ShahDbContext context, TokenManager tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<TypedResult<object>> LoginAsync(AdminLoginRequestDTO request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || Verify(request.Password, user.Password) == false)
        {
            throw new InvalidCredentialException("Invalid Credentials");
        }

        var accessToken = await _tokenService.CreateTokenAsync(user);
        string refreshToken;
        var now = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(user.RefreshToken) && user.RefreshTokenExpiryTime.HasValue && user.RefreshTokenExpiryTime > now)
        {
            // Reuse existing valid refresh token
            refreshToken = user.RefreshToken;
        }
        else
        {
            refreshToken = await _tokenService.CreateRefreshTokenAsync(user);
        }
        return TypedResult<object>.Success(new
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        }, "Successfully logged in");

    }
    
    
    public async Task<TypedResult<object>> LogoutAsync(string token)
    {
        // In a real-world application, you might want to implement token blacklisting or expiration.
        // For this example, we'll just return a success message.

        return await Task.FromResult(TypedResult<object>.Success(null, "Successfully logged out"));
    }
}