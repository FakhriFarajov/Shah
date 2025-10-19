using System.Reflection;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShahAuthApi.Application.Services.Utils;
using ShahSellerFeaturesApi.Application.Services.Classes;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using ShahSellerFeaturesApi.Infrastructure.Contexts;
using ShahSellerFeaturesApi.Infrastructure.MappingConfigurations;
using ShahSellerFeaturesApi.Infrastructure.Middlewares;

namespace ShahSellerFeaturesApi.Presentation.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOpenApi();
        services.AddControllers();

        services.AddDbContext<ShahDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("Mac")));

        services.AddScoped<IAddressService, AddressService>();
        services.AddScoped<ISellerService, SellerService>();
        services.AddScoped<CountryCodeService>();
        services.AddScoped<CategoryService>();
        services.AddScoped<TaxService>();
        services.AddScoped<IImageService, ImageService>();
        services.AddScoped<ImageService>();
        

        
        services.AddAutoMapper(ops => ops.AddProfile(typeof(MappingProfile)));
        
        services.AddSingleton<GlobalExceptionMiddleware>();

        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        
        
        services
            .AddFluentValidationAutoValidation()
            .AddFluentValidationClientsideAdapters();
        // Register validators from Infrastructure assembly
        services.AddValidatorsFromAssemblyContaining<ShahSellerFeaturesApi.Application.Validators.SellerEditRequesValidator>();
        
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
                builder.WithOrigins("http://localhost:5175")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
        });

        services.AddAuthorization(ops =>
        {
            ops.AddPolicy("SellerPolicy", builder => builder.RequireRole("Seller"));
        });

        return services;
    }
}