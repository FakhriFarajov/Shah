using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ShahAuthApi.Core.DTOs.BuyerDtos.Response;
using ShahAuthApi.Core.Models;
using ShahAuthApi.Infrastructure.Contexts;

namespace ShahAuthApi.Application.Services.Utils;


public class TokenManager
{
    private readonly IConfiguration _configuration;
    private readonly ShahDbContext _context;

    public TokenManager(IConfiguration configuration, ShahDbContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    public async Task<string> CreateTokenAsync(User user)
    {
        var claims = new List<Claim>
        {
            new Claim("id", user.Id),
            new Claim("name", user.Name ?? string.Empty),
            new Claim("surname", user.Surname ?? string.Empty),
            new Claim("email", user.Email ?? string.Empty),
            new Claim("role", ((ShahAuthApi.Core.Enums.Role)user.Role).ToString())
        };

        var role = (ShahAuthApi.Core.Enums.Role)user.Role;
        if (role == ShahAuthApi.Core.Enums.Role.Buyer)
        {
            claims.Add(new Claim("buyer_profile_id", user.BuyerProfileId ?? string.Empty));
            var favCount = await _context.Favorites.CountAsync(f => f.BuyerProfileId == user.BuyerProfileId);
            var cartCount = await _context.CartItems.CountAsync(c => c.BuyerProfileId == user.BuyerProfileId);
            claims.Add(new Claim("favorite_count", favCount.ToString()));
            claims.Add(new Claim("cart_count", cartCount.ToString()));
            claims.Add(new Claim("profile_image", user.BuyerProfile?.ImageProfile ?? string.Empty));
        }
        else if (role == ShahAuthApi.Core.Enums.Role.Seller)
        {
            claims.Add(new Claim("seller_profile_id", user.SellerProfileId ?? string.Empty));
            // Add more seller-specific claims if needed
        }
        else if (role == ShahAuthApi.Core.Enums.Role.Admin)
        {
            claims.Add(new Claim("admin_profile_id", user.AdminProfileId ?? string.Empty));
            // Add more admin-specific claims if needed
        }

        var securityKey =
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("JWT:SecretKey").Value));

        var signingCred = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature);

        var securityToken = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(150),
            issuer: _configuration.GetSection("JWT:Issuer").Value,
            audience: _configuration.GetSection("JWT:Audience").Value,
            signingCredentials: signingCred);

        string tokenString = new JwtSecurityTokenHandler().WriteToken(securityToken);
        return await Task.FromResult(tokenString);
    }

    public async Task<string> CreateEmailTokenAsync(ClaimsPrincipal buyer)
    {
        var claim = buyer.Claims.Where(c => c.Type == ClaimTypes.Email);

        var securityKey =
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("JWT:EmailKey").Value));

        var signingCred = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature);

        var securityToken = new JwtSecurityToken(
            claims: claim,
            expires: DateTime.UtcNow.AddMinutes(3),
            issuer: _configuration.GetSection("JWT:Issuer").Value,
            audience: _configuration.GetSection("JWT:Audience").Value,
            signingCredentials: signingCred);

        string tokenString = new JwtSecurityTokenHandler().WriteToken(securityToken);
        return tokenString;
    }


    public async Task<string> GetEmailFromTokenAsync(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        var securityToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

        if (securityToken == null)
            throw new SecurityTokenException("Invalid token");

        var username = securityToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email);

        return username.Value;
    }

    public async Task<bool> ValidateEmailTokenAsync(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var securityKey =
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("JWT:EmailKey").Value));

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = _configuration.GetSection("JWT:Issuer").Value,
            ValidAudience = _configuration.GetSection("JWT:Audience").Value,
            IssuerSigningKey = securityKey,
            ClockSkew = TimeSpan.Zero
        };


        var principal = await tokenHandler.ValidateTokenAsync(token, validationParameters);
        return principal.IsValid;
    }

    public async Task<TypedResult<TokenResponse>> RefreshTokenAsync(string refreshToken)
    {
        var userFromDb = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        if (userFromDb == null || userFromDb.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return TypedResult<TokenResponse>.Error( "Invalid or expired refresh token", 401);

        // Generate new refresh token
        var newRefreshToken = Guid.NewGuid().ToString();
        userFromDb.RefreshToken = newRefreshToken;
        userFromDb.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(1);
        await _context.SaveChangesAsync();

        // Generate new access token
        var accessToken = await CreateTokenAsync(userFromDb);
        return TypedResult<TokenResponse>.Success(new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken
        }, "Token refreshed successfully");
    }

    public async Task<string> CreateRefreshTokenAsync(User user)
    {
        var refreshToken = Guid.NewGuid().ToString();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(1);
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return refreshToken;
    }


}
