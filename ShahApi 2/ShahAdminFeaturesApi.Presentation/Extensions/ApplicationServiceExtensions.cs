using System.Reflection;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShahAdminFeaturesApi.Application.Services.Classes;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Application.Validators;
using ShahAdminFeaturesApi.Infrastructure.Contexts;
using ShahAdminFeaturesApi.Infrastructure.MappingConfigurations;
using ShahAdminFeaturesApi.Infrastructure.Middlewares;
using ShahAuthApi.Application.Services.Utils;
using ImageService = ShahAdminFeaturesApi.Application.Services.Classes.ImageService;

namespace ShahAdminFeaturesApi.Presentation.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOpenApi();
        services.AddControllers();

        services.AddDbContext<ShahDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("Mac")));

        services.AddScoped<IAddressService, AddressService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<ImageService>();
        services.AddScoped<CountryCodeService>();
        services.AddScoped<CategoryService>();
        services.AddScoped<IVariantService, VariantService>();
        
        
        // register mapping profiles from Infrastructure and Application assemblies
        services.AddAutoMapper(ops => ops.AddProfile(typeof(MappingProfile)));

        services.AddSingleton<GlobalExceptionMiddleware>();

        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        
        
        services
            .AddFluentValidationAutoValidation()
            .AddFluentValidationClientsideAdapters();
        // Register validators from Infrastructure assembly
        services.AddValidatorsFromAssemblyContaining<AdminEditRequestValidator>();

        
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
                            var refreshed = await tokenManager.RefreshTokenAsync(refreshToken, null);

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
            ops.AddPolicy("AdminPolicy", builder => builder.RequireRole("Admin"));
        });

        return services;
    }
}