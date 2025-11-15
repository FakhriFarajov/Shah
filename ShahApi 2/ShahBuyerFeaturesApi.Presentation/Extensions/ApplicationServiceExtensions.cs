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
using ShahBuyerFeaturesApi.Application.Services.Classes;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Application.Utils.GetChain;
using ShahBuyerFeaturesApi.Infrastructure.MappingConfigurations;
using ShahBuyerFeaturesApi.Infrastructure.Middlewares;
using AuthDbContext = ShahAuthApi.Infrastructure.Contexts.ShahDbContext;
using BuyerDbContext = ShahBuyerFeaturesApi.Infrastructure.Contexts.ShahDbContext;

namespace ShahBuyerFeaturesApi.Presentation.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOpenApi();
        services.AddControllers();

        // Buyer DB context (required by Buyer services)
        services.AddDbContext<BuyerDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("Mac")));

        // Auth DB context (required by TokenManager from Auth project)
        services.AddDbContext<AuthDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("Mac")));

        // Services
        services.AddScoped<IAddressService, AddressService>();
        services.AddScoped<IBuyerService, BuyerService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<ImageService>();
        services.AddScoped<CountryCodeService>();
        services.AddScoped<CategoryService>();
        services.AddScoped<TokenManager>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<ICheckoutService, CheckoutService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IPdfReceiptService, PdfReceiptService>(); 
        services.AddScoped<IEmailService, SmtpEmailService>();
        
        

        // Exception middleware
        services.AddSingleton<GlobalExceptionMiddleware>();

        // AutoMapper
        services.AddAutoMapper(ops => ops.AddProfile(typeof(MappingProfile)));
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        // FluentValidation
        services
            .AddFluentValidationAutoValidation()
            .AddFluentValidationClientsideAdapters();
        services.AddValidatorsFromAssemblyContaining<ShahBuyerFeaturesApi.Application.Validators.BuyerEditRequestValidator>();

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

                    var dbContext = context.HttpContext.RequestServices.GetRequiredService<BuyerDbContext>();
    
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

        services.AddAuthorization(options =>
        {
            options.AddPolicy("BuyerPolicy", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireAssertion(ctx =>
                {
                    if (ctx.User.IsInRole("Buyer")) return true;
                    var claims = ctx.User.Claims;
                    var roleClaims = claims
                        .Where(c => c.Type == "role" || c.Type == "roles" || c.Type == ClaimTypes.Role)
                        .SelectMany(c => c.Value.Split(',', ' ', ';'))
                        .Where(v => !string.IsNullOrWhiteSpace(v))
                        .Select(v => v.Trim());
                    return roleClaims.Any(v => string.Equals(v, "Buyer", StringComparison.OrdinalIgnoreCase));
                });
            });
        });

        // CORS
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
