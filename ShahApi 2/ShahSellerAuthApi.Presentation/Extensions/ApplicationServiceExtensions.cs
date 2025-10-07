using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShahSellerAuthApi.Infrastructure.MappingConfigurations;
using ShahSellerAuthApi.Application.Services.Classes;
using ShahSellerAuthApi.Application.Services.Interfaces;
using ShahSellerAuthApi.Application.Utils;
using ShahSellerAuthApi.Infrastructure.Contexts;
using ShahSellerAuthApi.Infrastructure.Middlewares;

namespace ShahSellerAuthApi.Presentation.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOpenApi();
        services.AddControllers();

        services.AddDbContext<ShahDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("Mac")));

        services.AddScoped<IAccountService, AccountService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ISellerService, SellerService>();
        services.AddScoped<TokenManager>();
        services.AddSingleton<EmailSender>();
        
        
        services.AddAutoMapper(ops => ops.AddProfile(typeof(MappingProfile)));
        
        services.AddSingleton<GlobalExceptionMiddleware>();

        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["JWT:Issuer"],
                    ValidAudience = configuration["JWT:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(configuration["JWT:SecretKey"] ?? string.Empty))
                };

                // Custom OnAuthenticationFailed event for refresh token logic
                options.Events.OnAuthenticationFailed = async context =>
                {
                    var req = context.Request;
                    var res = context.Response;

                    // If refresh token is present in header
                    if (req.Headers.TryGetValue("refreshToken", out var hdr) && !string.IsNullOrWhiteSpace(hdr))
                    {
                        var tokenManager = context.HttpContext.RequestServices.GetRequiredService<TokenManager>();
                        var refreshToken = hdr.ToString();
                        var refreshed = await tokenManager.RefreshTokenAsync(refreshToken);

                        if (refreshed is not null)
                        {
                            // Return new tokens in headers
                            res.Headers["accessToken"] = refreshed.AccessToken;
                            res.Headers["refreshToken"] = refreshed.RefreshToken;

                            // 200 OK so frontend can retry with new access token
                            res.StatusCode = StatusCodes.Status200OK;
                            return;
                        }
                    }

                    // If refresh not provided/invalid, return 401
                    res.StatusCode = StatusCodes.Status401Unauthorized;
                };
            });

        services.AddAuthorization(ops =>
        {
            ops.AddPolicy("BuyerPolicy", builder => builder.RequireRole("Buyer"));
        });

        return services;
    }
}