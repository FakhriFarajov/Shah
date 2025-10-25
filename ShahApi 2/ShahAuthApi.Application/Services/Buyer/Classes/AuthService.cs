using System.Security.Authentication;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShahAuthApi.Application.Services.Buyer.Interfaces;
using ShahAuthApi.Application.Services.Utils;
using ShahAuthApi.Core.DTOs.BuyerDtos.Request;
using ShahAuthApi.Core.DTOs.BuyerDtos.Response;
using ShahAuthApi.Core.Models;
using ShahAuthApi.Infrastructure.Contexts;
using static BCrypt.Net.BCrypt;
using RefreshRequest = ShahAuthApi.Core.DTOs.BuyerDtos.Request.RefreshRequest;

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
        // 1. Blacklist the current access token
        await _tokenService.BlacklistTokenAsync(token, DateTime.UtcNow.AddMinutes(3));

        // 2. Find the user associated with this token
        var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken != null);
        if (user != null)
        {
            // 3. Invalidate the refresh token
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        return TypedResult<object>.Success(null, "Successfully logged out");
    }
    
    //Auth 
    public async Task<TypedResult<object>> RefreshTokenAsync(RefreshRequest request)
    {
        if (string.IsNullOrEmpty(request.RefreshToken))
            return TypedResult<object>.Error("Refresh token is required", 400);

        var result = await _tokenService.RefreshTokenAsync(request.RefreshToken, request.OldAccessToken);

        if (!result.IsSuccess)
            return TypedResult<object>.Error(result.Message, 401);

        return TypedResult<object>.Success(new
        {
            accessToken = result.Data.AccessToken,
            refreshToken = result.Data.RefreshToken
        });
    }





}