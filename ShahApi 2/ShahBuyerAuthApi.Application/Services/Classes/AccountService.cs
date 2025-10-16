using System.Security.Claims;
using System.Text;
using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using ShahBuyerAuthApi.Application.Services.Interfaces;
using ShahBuyerAuthApi.Contracts.DTOs.Request;
using ShahBuyerAuthApi.Contracts.DTOs.Response;
using ShahBuyerAuthApi.Core.Enums;
using ShahBuyerAuthApi.Core.Models;
using ShahBuyerAuthApi.Infrastructure.Contexts;
using static BCrypt.Net.BCrypt;

namespace ShahBuyerAuthApi.Application.Services.Classes;


public class AccountService : IAccountService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;
    private readonly IWebHostEnvironment _env;
    private readonly EmailSender _emailSender;

    public AccountService(ShahDbContext context, IMapper mapper, IWebHostEnvironment env, EmailSender emailSender)
    {
        _context = context;
        _mapper = mapper;
        _env = env;
        _emailSender = emailSender;
    }
    

    
    public async Task<Result> RegisterBuyerAsync(BuyerRegisterRequestDTO request)
    {
        // Normalize email to lowercase
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (existingUser != null)
        {
            return Result.Error("Email is already registered.", 409);
        }

        var userToAdd = _mapper.Map<User>(request);
        userToAdd.Email = normalizedEmail;
        userToAdd.Password = HashPassword(request.Password);
        userToAdd.Role = Role.Buyer; // Set role directly

        var buyerProfile = _mapper.Map<BuyerProfile>(request);
        buyerProfile.UserId = userToAdd.Id;

        userToAdd.BuyerProfileId = buyerProfile.Id;

        _context.Users.Add(userToAdd);
        _context.BuyerProfiles.Add(buyerProfile);

        await _context.SaveChangesAsync();

        return Result.Success("Buyer registered successfully");
    }


    public async Task ConfirmEmailAsync(ClaimsPrincipal userClaims, string token, HttpContext context)
    {
        var email = userClaims.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value;
        
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        var filePath = Path.Combine(_env.WebRootPath, "ConfirmMessage.html");

        var messageContent = new StringBuilder(await File.ReadAllTextAsync(filePath));

        var link = $"{context.Request.Scheme}://{context.Request.Host}/api/Account/VerifyToken/{user.Id}/{token}";
        
        messageContent.Replace("{User}", user.Name);
        messageContent.Replace("{ConfirmationLink}", link);
        
        await _emailSender.SendEmailAsync(user.Email, "Confirm your email", messageContent.ToString());
    }

    public async Task<Result> VerifyEmailAsync(string id)
    {
        var user = await _context.Users.FindAsync(id);
        user.EmailConfirmed = true;
        await _context.SaveChangesAsync();
        
        return Result.Success("Email confirmed");
    }
    
    public async Task<Result> ForgotPasswordAsync(ForgotPasswordRequestDTO request)
    {
        var user = await _context.Users.FindAsync(request.userId);
        if (user == null)
        {
            return Result.Error("User not found", 404);
        }
    
        if (!Verify(request.OldPassword, user.Password))
        {
            return Result.Error("Old password is incorrect", 400);
        }
    
        user.Password = HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();
    
        return Result.Success("Password updated successfully");
    }
}
