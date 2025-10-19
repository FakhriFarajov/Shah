using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;
using FluentValidation.AspNetCore;
using ShahAuthApi.Application.Services.Utils;
using ShahBuyerFeaturesApi.Application.Services.Classes;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Application.Utils.GetChain;
using ShahBuyerFeaturesApi.Infrastructure.MappingConfigurations;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;
using ShahBuyerFeaturesApi.Infrastructure.Middlewares;

namespace ShahBuyerFeaturesApi.Presentation.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOpenApi();
        services.AddControllers();

        services.AddDbContext<ShahDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("Mac")));

        services.AddScoped<IAddressService, AddressService>();
        services.AddScoped<IBuyerService, BuyerService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped< ImageService>();

        services.AddScoped<CountryCodeService>();

        
        services.AddAutoMapper(ops => ops.AddProfile(typeof(MappingProfile)));
        
        services.AddSingleton<GlobalExceptionMiddleware>();

        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        
        
        services
            .AddFluentValidationAutoValidation()
            .AddFluentValidationClientsideAdapters();
        // Register validators from Infrastructure assembly
        services.AddValidatorsFromAssemblyContaining<ShahBuyerFeaturesApi.Application.Validators.BuyerEditRequestValidator>();


        
        
        

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
                        Encoding.UTF8.GetBytes(configuration["JWT:SecretKey"]))
                };
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

        services.AddAuthorization(ops =>
        {
            ops.AddPolicy("BuyerPolicy", builder => builder.RequireRole("Buyer"));
        });

        return services;
    }
}