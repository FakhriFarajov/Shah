using System.IdentityModel.Tokens.Jwt;
using System.Reflection;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using ShahBuyerAuthApi.Application.Services.Classes;
using ShahBuyerAuthApi.Application.Services.Interfaces;
using ShahBuyerAuthApi.Infrastructure.Contexts;
using ShahBuyerAuthApi.Infrastructure.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShahBuyerAuthApi.Application.Utils;
using ShahBuyerAuthApi.Infrastructure.MappingConfigurations;

namespace ShahBuyerAuthApi.Presentation.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOpenApi();
        services.AddControllers();

        services.AddDbContext<ShahDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("Mac")));

        services.AddScoped<IAccountService, AccountService>();
        services.AddScoped<TokenManager>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IBuyerService, BuyerService>();
        services.AddSingleton<EmailSender>();
        services.AddScoped<ImageService>();

        services.AddSingleton<GlobalExceptionMiddleware>();
        
        services
            .AddFluentValidationAutoValidation()
            .AddFluentValidationClientsideAdapters();
        // Register validators from Infrastructure assembly
        services.AddValidatorsFromAssemblyContaining<ShahBuyerAuthApi.Infrastructure.Validators.BuyerRegisterRequestDTOValidator>();

        
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
                    },

                    OnTokenValidated = async context =>
                    {
                        var token = context.SecurityToken as JwtSecurityToken;
                        if (token == null) return;

                        var dbContext = context.HttpContext.RequestServices.GetRequiredService<ShahDbContext>();
                        var blacklisted = await dbContext.BlacklistedTokens
                            .AnyAsync(t => t.Token == token.RawData);

                        if (blacklisted)
                        {
                            context.Fail("This token has been revoked");
                        }
                    }
                };
            });
                

            services.AddAuthorization(ops =>
            {
                ops.AddPolicy("BuyerPolicy", builder => builder.RequireRole("Buyer"));
            });

            services.AddCors(options =>
            {
                options.AddPolicy("DefaultCors", builder =>
                {
                    builder.WithOrigins("http://localhost:5174")
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials();
                });
            });

            return services;
        }
}