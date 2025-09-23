using System.Security.Authentication;
using Microsoft.EntityFrameworkCore;
using ShahBuyerAuthApi.Application.Services.Interfaces;
using ShahBuyerAuthApi.Contracts.DTOs.Request;
using ShahBuyerAuthApi.Contracts.DTOs.Response;
using ShahBuyerAuthApi.Infrastructure.Contexts;
using static BCrypt.Net.BCrypt;

namespace ShahBuyerAuthApi.Application.Services.Classes;


public class AuthService : IAuthService
{
    private readonly ShahDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthService(ShahDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<TypedResult<object>> LoginAsync(BuyerLoginRequestDTO request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || Verify(request.Password, user.Password) == false)
        {
            throw new InvalidCredentialException("Invalid Credentials");
        }

        var accessToken = await _tokenService.CreateTokenAsync(user);

        return TypedResult<object>.Success(new
        {
            AccessToken = accessToken,
        }, "Successfully logged in");

    }
}