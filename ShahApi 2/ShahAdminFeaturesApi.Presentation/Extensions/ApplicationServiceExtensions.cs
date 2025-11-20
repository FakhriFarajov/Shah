using System.IdentityModel.Tokens.Jwt;
using System.Reflection;
using System.Security.Claims;
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

        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IAddressService, AddressService>();
        services.AddScoped<IBuyerService, BuyerService>();
        services.AddScoped<IWarehouseService, WarehouseService>();
        services.AddScoped<ISellerService, SellerService>();
        services.AddScoped<TaxService>();
        services.AddScoped<ImageService>();
        services.AddScoped<CountryCodeService>();
        services.AddScoped<CategoryService>();
        services.AddScoped<IAttributeService, AttributeService>();
        services.AddScoped<IAttributeValueService, AttributeValueService>();
        services.AddScoped<IAdminOrderService, AdminOrderService>();
        services.AddScoped<IProductService, ProductService>();
        
        // register mapping profiles from Infrastructure and Application assemblies
        services.AddAutoMapper(ops => ops.AddProfile(typeof(MappingProfile)));

        services.AddSingleton<GlobalExceptionMiddleware>();

        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        services
            .AddFluentValidationAutoValidation()
            .AddFluentValidationClientsideAdapters();
        // Register validators from Infrastructure assembly
        services.AddValidatorsFromAssemblyContaining<AdminEditRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<AddAdminRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<BuyerEditRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<SellerEditRequestValidator>();
        
        

        
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
        
        // Authorization (single source of truth)
        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminPolicy", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireAssertion(ctx =>
                {
                    // Built-in role check (uses RoleClaimType configured above)
                    if (ctx.User.IsInRole("Admin")) return true;

                    // Fallback: tolerate different claim type names or delimited formats
                    var claims = ctx.User.Claims;
                    var roleClaims = claims
                        .Where(c => c.Type == "role" || c.Type == "roles" || c.Type == ClaimTypes.Role)
                        .SelectMany(c => c.Value.Split(',', ' ', ';'))
                        .Where(v => !string.IsNullOrWhiteSpace(v))
                        .Select(v => v.Trim());

                    return roleClaims.Any(v => string.Equals(v, "Admin", StringComparison.OrdinalIgnoreCase));
                });
            });
            
            // New: AdminOrBuyer policy for endpoints accessible by Admin or Buyer
            options.AddPolicy("AdminOrBuyer", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireAssertion(ctx =>
                {
                    // Quick path using built-in role checks
                    if (ctx.User.IsInRole("Admin") || ctx.User.IsInRole("Buyer")) return true;
                    
                    // Fallback for different claim type names or delimited values
                    var claims = ctx.User.Claims;
                    var roleClaims = claims
                        .Where(c => c.Type == "role" || c.Type == "roles" || c.Type == ClaimTypes.Role)
                        .SelectMany(c => c.Value.Split(',', ' ', ';'))
                        .Where(v => !string.IsNullOrWhiteSpace(v))
                        .Select(v => v.Trim());

                    return roleClaims.Any(v => string.Equals(v, "Admin", StringComparison.OrdinalIgnoreCase)
                                            || string.Equals(v, "Buyer", StringComparison.OrdinalIgnoreCase));
                });
            });
        });
        
        services.AddCors(options =>
        {
            options.AddPolicy("DefaultCors", builder =>
            {
                builder.WithOrigins("http://localhost:5173")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
        });


        return services;
    }

    private static void ApplyDatabasePatches(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ShahAdminFeaturesApi.Infrastructure.Contexts.ShahDbContext>();
        try
        {
            var addItemStatus = @"
IF COL_LENGTH('dbo.OrderItems','Status') IS NULL
BEGIN
    ALTER TABLE [dbo].[OrderItems] ADD [Status] int NOT NULL CONSTRAINT DF_OrderItems_Status_ADMIN DEFAULT(0);
END
";
            db.Database.ExecuteSqlRaw(addItemStatus);
        }
        catch { }
    }
}