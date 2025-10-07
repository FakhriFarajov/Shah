using System.Security.Claims;
using System.Text;
using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using ShahSellerAuthApi.Application.Services.Interfaces;
using ShahSellerAuthApi.Application.Utils;
using ShahSellerAuthApi.Contracts.DTOs.Request;
using ShahSellerAuthApi.Contracts.DTOs.Response;
using ShahSellerAuthApi.Data.Enums;
using ShahSellerAuthApi.Data.Models;
using ShahSellerAuthApi.Infrastructure.Contexts;
using static BCrypt.Net.BCrypt;

namespace ShahSellerAuthApi.Application.Services.Classes;


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
    

    
    public async Task<Result> RegisterSellerAsync(SellerRegisterRequestDTO request)
    {
        // Normalize email to lowercase
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (existingUser != null)
        {
            return Result.Error("Email is already registered.", 409);
        }

        // Map and create User
        var userToAdd = _mapper.Map<User>(request);
        userToAdd.Email = normalizedEmail;
        userToAdd.Password = HashPassword(request.Password);
        userToAdd.Role = Role.Seller;
        userToAdd.CreatedAt = DateTime.UtcNow;
        _context.Users.Add(userToAdd);
        await _context.SaveChangesAsync();

        // Map and create SellerProfile
        var sellerProfile = _mapper.Map<SellerProfile>(request);
        sellerProfile.UserId = userToAdd.Id;
        sellerProfile.Passport = request.Passport;
        _context.SellerProfiles.Add(sellerProfile);
        await _context.SaveChangesAsync();

        // Map and create StoreInfo
        var storeInfo = _mapper.Map<StoreInfo>(request);
        storeInfo.SellerProfileId = sellerProfile.Id;
        _context.StoreInfos.Add(storeInfo);
        await _context.SaveChangesAsync();

        // Map and create SellerTaxInfo
        var taxInfo = _mapper.Map<SellerTaxInfo>(request);
        taxInfo.SellerProfileId = sellerProfile.Id;
        _context.SellerTaxInfos.Add(taxInfo);
        await _context.SaveChangesAsync();

        // Link everything together
        sellerProfile.StoreInfoId = storeInfo.Id;
        sellerProfile.SellerTaxInfoId = taxInfo.Id;
        userToAdd.SellerProfileId = sellerProfile.Id;
        _context.Users.Update(userToAdd);
        _context.SellerProfiles.Update(sellerProfile);
        await _context.SaveChangesAsync();

        return Result.Success("Seller registered successfully");
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

    public async Task<Result> ForgotPasswordAsync(string email, string newPassword, string OldPassword)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        if (user == null || !Verify(OldPassword, user.Password))
            return Result.Error("User with this email does not exist or the password is incorrect.", 404);

        user.Password = HashPassword(newPassword);
        await _context.SaveChangesAsync();

        return Result.Success("Password has been reset successfully.");
    }
    
}
