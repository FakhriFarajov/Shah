using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShahBuyerFeaturesApi.Application.Services.Classes;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
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

        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IAddressService, AddressService>();
        services.AddScoped<IBuyerService, Application.Services.Classes.BuyerService>();
        
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
                        Encoding.UTF8.GetBytes(configuration["JWT:SecretKey"]))
                };
            });

        services.AddAuthorization(ops =>
        {
            ops.AddPolicy("BuyerPolicy", builder => builder.RequireRole("Buyer"));
        });

        return services;
    }
}