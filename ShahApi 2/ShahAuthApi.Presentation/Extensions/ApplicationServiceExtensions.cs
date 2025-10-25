using System.IdentityModel.Tokens.Jwt;
using System.Reflection;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using ShahAuthApi.Infrastructure.Contexts;
using ShahAuthApi.Infrastructure.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShahAuthApi.Application.Services.Buyer.Classes;
using ShahAuthApi.Application.Services.Buyer.Interfaces;
using ShahAuthApi.Application.Services.Utils;
using ShahAuthApi.Core.Enums;
using ShahAuthApi.Infrastructure.MappingConfigurations;

namespace ShahAuthApi.Presentation.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOpenApi();
        services.AddControllers();

        services.AddDbContext<ShahDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("Mac")));

        services.AddScoped<ShahAuthApi.Application.Services.Buyer.Interfaces.IAccountService, ShahAuthApi.Application.Services.Buyer.Classes.AccountService>(); // Buyer
        services.AddScoped<ShahAuthApi.Application.Services.Seller.Interfaces.IAccountService, ShahAuthApi.Application.Services.Seller.Classes.AccountService>(); // Seller
        services.AddScoped<ShahAuthApi.Application.Services.Admin.Interfaces.IAccountService, ShahAuthApi.Application.Services.Admin.Classes.AccountService>();
        services.AddScoped<ShahAuthApi.Application.Services.Admin.Interfaces.IAdminService, ShahAuthApi.Application.Services.Admin.Classes.AdminService>();
        
        services.AddScoped<ShahAuthApi.Application.Services.Buyer.Interfaces.IAuthService, ShahAuthApi.Application.Services.Buyer.Classes.AuthService>(); // Buyer
        services.AddScoped<ShahAuthApi.Application.Services.Seller.Interfaces.IAuthService, ShahAuthApi.Application.Services.Seller.Classes.AuthService>(); // Seller
        services.AddScoped<ShahAuthApi.Application.Services.Admin.Interfaces.IAuthService, ShahAuthApi.Application.Services.Admin.Classes.AuthService>();

        
        
        services.AddScoped<ShahAuthApi.Application.Services.Seller.Interfaces.ISellerService, ShahAuthApi.Application.Services.Seller.Classes.SellerService>();
        services.AddScoped<TokenManager>();
        
        services.AddScoped<IBuyerService, BuyerService>();
        services.AddSingleton<EmailSender>();
        services.AddScoped<ImageService>();

        services.AddSingleton<GlobalExceptionMiddleware>();
        
        services
            .AddFluentValidationAutoValidation()
            .AddFluentValidationClientsideAdapters();
        // Register validators from Infrastructure assembly
        services.AddValidatorsFromAssemblyContaining<ShahAuthApi.Infrastructure.Validators.BuyerRegisterRequestDTOValidator>();
        services.AddValidatorsFromAssemblyContaining<ShahAuthApi.Infrastructure.Validators.SellerRegisterRequestDTOValidator>();
        services.AddValidatorsFromAssemblyContaining<ShahAuthApi.Infrastructure.Validators.AdminRegisterRequestDTOValidator>();
        

        
        services.AddAutoMapper(ops => ops.AddProfile(typeof(MappingProfileBuyer)));
        services.AddAutoMapper(ops => ops.AddProfile(typeof(MappingProfileSeller)));
        services.AddAutoMapper(ops => ops.AddProfile(typeof(MappingProfileAdmin)));
        
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
                    Encoding.UTF8.GetBytes(configuration["JWT:SecretKey"] ?? string.Empty)),
                RoleClaimType = "role"
            };

            options.Events = new JwtBearerEvents
            {
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

                
        services.AddAuthorization(options =>
        {
            options.AddPolicy("BuyerPolicy", policy =>
                policy.RequireRole(Role.Buyer.ToString()));

            options.AddPolicy("SellerPolicy", policy =>
                policy.RequireRole(Role.Seller.ToString()));

            options.AddPolicy("AdminPolicy", policy =>
                policy.RequireRole(Role.Admin.ToString()));
        });


            services.AddCors(options =>
            {
                options.AddPolicy("DefaultCors", builder =>
                {
                    builder.WithOrigins("http://localhost:5174" , "http://localhost:5175")
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials();
                });
            });

            return services;
        }
}