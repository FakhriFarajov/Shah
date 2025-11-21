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
            new Claim("role", ((Core.Enums.Role)user.Role).ToString())
        };

        var role = (Core.Enums.Role)user.Role;

        if (role == Core.Enums.Role.Buyer)
        {
            claims.Add(new Claim("buyer_profile_id", user.BuyerProfileId ?? string.Empty));
            var favCount = await _context.Favorites.CountAsync(f => f.BuyerProfileId == user.Id);
            var cartCount = await _context.CartItems.CountAsync(c => c.BuyerProfileId == user.Id);
            claims.Add(new Claim("favorite_count", favCount.ToString()));
            claims.Add(new Claim("cart_count", cartCount.ToString()));
            claims.Add(new Claim("profile_image", user.BuyerProfile?.ImageProfile ?? string.Empty));
        }
        else if (role == Core.Enums.Role.Seller)
        {
            claims.Add(new Claim("seller_profile_id", user.SellerProfileId ?? string.Empty));
        }
        else if (role == Core.Enums.Role.Admin)
        {
            claims.Add(new Claim("admin_profile_id", user.AdminProfileId ?? string.Empty));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:SecretKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["JWT:Issuer"],
            audience: _configuration["JWT:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(3),
            signingCredentials: creds);

        return await Task.FromResult(new JwtSecurityTokenHandler().WriteToken(token));
    }



   public async Task<string> CreateEmailTokenAsync(ClaimsPrincipal buyer)
        {
            var emailClaim = buyer.Claims.Where(c => c.Type == ClaimTypes.Email);

            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["JWT:EmailKey"])
            );
            var signingCred = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature);

            var securityToken = new JwtSecurityToken(
                claims: emailClaim,
                expires: DateTime.UtcNow.AddMinutes(3),
                issuer: _configuration["JWT:Issuer"],
                audience: _configuration["JWT:Audience"],
                signingCredentials: signingCred
            );

            return new JwtSecurityTokenHandler().WriteToken(securityToken);
        }

        public async Task<string> GetEmailFromTokenAsync(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

            if (securityToken == null)
                throw new SecurityTokenException("Invalid token");

            var emailClaim = securityToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email);
            return emailClaim?.Value;
        }

        public async Task<bool> ValidateEmailTokenAsync(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["JWT:EmailKey"])
            );

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _configuration["JWT:Issuer"],
                ValidAudience = _configuration["JWT:Audience"],
                IssuerSigningKey = securityKey,
                ClockSkew = TimeSpan.Zero
            };

            var principal = await tokenHandler.ValidateTokenAsync(token, validationParameters);
            return principal.IsValid;
        }
    public async Task<TypedResult<RefreshTokenResponse>> RefreshTokenAsync(string refreshToken, string oldAccessToken)
    {
        if (string.IsNullOrEmpty(refreshToken))
            return TypedResult<RefreshTokenResponse>.Error("Refresh token is required", 400);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            if (user != null)
            {
                // Clear expired refresh token
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }
            return TypedResult<RefreshTokenResponse>.Error("Invalid or expired refresh token", 401);
        }

        if (!string.IsNullOrEmpty(oldAccessToken))
        {
            await BlacklistTokenAsync(oldAccessToken, DateTime.UtcNow.AddMinutes(3));
        }

        var newAccessToken = await CreateTokenAsync(user);
        var newRefreshToken = await CreateRefreshTokenAsync(user);

        return TypedResult<RefreshTokenResponse>.Success(
            new RefreshTokenResponse(newAccessToken, newRefreshToken),
            "Token refreshed successfully"
        );
    }

    public async Task BlacklistTokenAsync(string token, DateTime expiry)
    {
        if (string.IsNullOrEmpty(token)) return;

        await _context.BlacklistedTokens.AddAsync(new BlacklistedToken
        {
            Token = token,
            ExpiryTime = expiry
        });

        await _context.SaveChangesAsync();
    }
    
    public async Task<string> CreateRefreshTokenAsync(User user)
    {
        var refreshToken = Guid.NewGuid().ToString();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(1);//Change
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return refreshToken;
    }
}
