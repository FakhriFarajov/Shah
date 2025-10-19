using System.Security.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShahAuthApi.Application.Services.Buyer.Interfaces;
using ShahAuthApi.Application.Services.Utils;
using ShahAuthApi.Core.DTOs.BuyerDtos.Request;
using ShahAuthApi.Core.DTOs.BuyerDtos.Response;
using ShahAuthApi.Core.Models;
using ShahAuthApi.Infrastructure.Contexts;
using static BCrypt.Net.BCrypt;

namespace ShahAuthApi.Application.Services.Buyer.Classes;


public class AuthService : IAuthService
{
    private readonly ShahDbContext _context;
    private readonly TokenManager _tokenService;

    public AuthService(ShahDbContext context, TokenManager tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<TypedResult<object>> LoginAsync(BuyerLoginRequestDTO request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || Verify(request.Password, user.Password) == false)
        {
            throw new InvalidCredentialException("Invalid Credentials or no such user exists");
        }
        
        if (string.IsNullOrEmpty(user.BuyerProfileId))
        {
            return TypedResult<object>.Error("User is not a buyer.", 403);
        }

        var accessToken = await _tokenService.CreateTokenAsync(user);
        string refreshToken;
        var now = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(user.RefreshToken) && user.RefreshTokenExpiryTime.HasValue &&
            user.RefreshTokenExpiryTime > now)
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
            RefreshToken = refreshToken,

        }, "Successfully logged in");

    }

    public async Task<TypedResult<object>> LogoutAsync(string token)
    {
        await BlacklistTokenAsync(token, DateTime.UtcNow.AddHours(1)); // Set expiry as needed
        return TypedResult<object>.Success(null, "Successfully logged out");
    }
    
    public async Task BlacklistTokenAsync(string token, DateTime expiry)
    {
        var blacklisted = new BlacklistedToken
        {
            Token = token,
            ExpiryTime = expiry
        };
        
        await _context.BlacklistedTokens.AddAsync(blacklisted);
        await _context.SaveChangesAsync();
    }



    public async Task<TypedResult<object>> RefreshTokenAsync([FromBody] string refreshToken)
    {
        if (string.IsNullOrEmpty(refreshToken))
            return TypedResult<object>.Error("Refresh token is required", 400);

        var result = await _tokenService.RefreshTokenAsync(refreshToken);

        if (!result.IsSuccess)
            return TypedResult<object>.Error(result.Message, 400);

        return TypedResult<object>.Success(new
        {
            isSuccess = true,
            message = result.Message,
            data = new
            {
                accessToken = result.Data.AccessToken,
                refreshToken = result.Data.RefreshToken
            }
        }, "Token refreshed successfully");
    }
}