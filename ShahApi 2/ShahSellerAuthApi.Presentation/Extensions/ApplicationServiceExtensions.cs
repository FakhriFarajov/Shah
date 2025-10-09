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
        services.AddScoped<IImageService, ImageService>();
        services.AddScoped<TokenManager>();
        services.AddSingleton<EmailSender>();
        services.AddSingleton<GlobalExceptionMiddleware>();
        
        
        services.AddAutoMapper(ops => ops.AddProfile(typeof(MappingProfile)));
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
                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = async context =>
                    {
                        var req = context.Request;
                        var res = context.Response;

                        if (req.Headers.TryGetValue("refreshToken", out var hdr) && !string.IsNullOrWhiteSpace(hdr))
                        {
                            var tokenManager = context.HttpContext.RequestServices.GetRequiredService<TokenManager>();
                            var refreshToken = hdr.ToString();
                            var refreshed = await tokenManager.RefreshTokenAsync(refreshToken);

                            if (refreshed != null && refreshed.IsSuccess && refreshed.Data != null)
                            {
                                var data = refreshed.Data;
                                var accessTokenProp = data.GetType().GetProperty("AccessToken");
                                var refreshTokenProp = data.GetType().GetProperty("RefreshToken");

                                var accessToken = accessTokenProp?.GetValue(data)?.ToString();
                                var refreshTokenNew = refreshTokenProp?.GetValue(data)?.ToString();

                                if (!string.IsNullOrEmpty(accessToken) && !string.IsNullOrEmpty(refreshTokenNew))
                                {
                                    res.Headers["accessToken"] = accessToken;
                                    res.Headers["refreshToken"] = refreshTokenNew;
                                    res.StatusCode = StatusCodes.Status200OK;
                                    return;
                                }
                            }
                        }

                        res.StatusCode = StatusCodes.Status401Unauthorized;
                    }
                };
            });

        services.AddAuthorization(ops =>
        {
            ops.AddPolicy("SellerPolicy", builder => builder.RequireRole("Seller"));
        });

        return services;
    }
}