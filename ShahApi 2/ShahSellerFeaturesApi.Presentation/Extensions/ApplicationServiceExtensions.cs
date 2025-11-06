using System.IdentityModel.Tokens.Jwt;
using System.Reflection;
using System.Text;
using System.Security.Claims;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShahAuthApi.Application.Services.Utils;
using ShahAuthApi.Infrastructure.MappingConfigurations;
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

        services.AddScoped<ISellerService, SellerService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<CountryCodeService>();
        services.AddScoped<CategoryService>();
        services.AddScoped<TaxService>();
        services.AddScoped<ImageService>();
        
        
        services.AddAutoMapper(ops => ops.AddProfile(typeof(MappingSeller)), Assembly.GetExecutingAssembly());
        services.AddSingleton<GlobalExceptionMiddleware>();
        
        services
            .AddFluentValidationAutoValidation()
            .AddFluentValidationClientsideAdapters();
        // Register validators from Infrastructure assembly
        services.AddValidatorsFromAssemblyContaining<ShahSellerFeaturesApi.Application.Validators.SellerEditRequestValidator>();
        
        // Authentication
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
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:SecretKey"])),
                RoleClaimType = "role",
                ClockSkew = TimeSpan.Zero
            };

            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = async context =>
                {
                    // Explicitly fail: do not refresh inline; client must call refresh endpoint
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await Task.CompletedTask;
                },
                OnTokenValidated = async context =>
                {
                    if (context.SecurityToken is not JwtSecurityToken token) return;

                    var dbContext = context.HttpContext.RequestServices.GetRequiredService<ShahDbContext>();
    
                    // Cleanup expired blacklisted tokens
                    await dbContext.BlacklistedTokens
                        .Where(t => t.ExpiryTime <= DateTime.UtcNow)
                        .ExecuteDeleteAsync();

                    var isBlacklisted = await dbContext.BlacklistedTokens
                        .AnyAsync(t => t.Token == token.RawData.Trim());

                    if (isBlacklisted)
                    {
                        context.Fail("This token has been revoked");
                    }
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
            ops.AddPolicy("SellerPolicy", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireAssertion(ctx =>
                {
                    // Direct IsInRole check (covers ClaimTypes.Role mapped by framework)
                    if (ctx.User.IsInRole("Seller")) return true;

                    var claims = ctx.User.Claims;
                    // Accept multiple common role claim types
                    var roleClaims = claims
                        .Where(c => c.Type == "role" || c.Type == "roles" || c.Type == ClaimTypes.Role)
                        .SelectMany(c => c.Value.Split(',', ' ', ';'))
                        .Where(v => !string.IsNullOrWhiteSpace(v))
                        .Select(v => v.Trim());

                    return roleClaims.Any(v => string.Equals(v, "Seller", StringComparison.OrdinalIgnoreCase));
                });
            });
        });

        return services;
    }
}