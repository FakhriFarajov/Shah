using System.Security.Claims;
using System.Text;
using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using ShahAuthApi.Application.Services.Seller.Interfaces;
using ShahAuthApi.Application.Services.Utils;
using ShahAuthApi.Core.DTOs.SellerDtos.Request;
using ShahAuthApi.Core.DTOs.SellerDtos.Response;
using ShahAuthApi.Core.Enums;
using ShahAuthApi.Core.Models;
using ShahAuthApi.Infrastructure.Contexts;
using static BCrypt.Net.BCrypt;

namespace ShahAuthApi.Application.Services.Seller.Classes;


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
        // Check for existing user
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (existingUser != null)
            return Result.Error("Seller Email is already registered.", 409);
        
        var existingStoreEmail = await _context.StoreInfos.FirstOrDefaultAsync(u => u.StoreEmail.ToLower() == request.Email.ToLower());
        if (existingStoreEmail != null)
            return Result.Error("Store Email is already registered.", 409);

        // Validate CategoryId if provided
        string? categoryId = string.IsNullOrWhiteSpace(request.CategoryId) ? null : request.CategoryId;
        if (categoryId != null)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == categoryId);
            if (!categoryExists)
                return Result.Error("CategoryId does not exist.", 400);
        }

        // Map and create User
        var userToAdd = _mapper.Map<User>(request);
        userToAdd.Password = HashPassword(request.Password);
        userToAdd.Role = Role.Seller;
        _context.Users.Add(userToAdd);
        await _context.SaveChangesAsync(); // Save to generate UserId

        // Map and create SellerTaxInfo
        var storeTaxInfo = _mapper.Map<SellerTaxInfo>(request);
        _context.SellerTaxInfos.Add(storeTaxInfo);
        await _context.SaveChangesAsync(); // Save to generate IDs

        // Map and create SellerProfile (StoreInfoId = null for now)
        var sellerProfile = _mapper.Map<SellerProfile>(request);
        sellerProfile.Id = userToAdd.Id; // Ensure PK and FK match
        sellerProfile.UserId = userToAdd.Id;
        sellerProfile.SellerTaxInfoId = storeTaxInfo.Id;
        sellerProfile.IsVerified = false;
        sellerProfile.Passport = request.Passport;
        sellerProfile.StoreInfoId = null; // StoreInfo not created yet
        _context.SellerProfiles.Add(sellerProfile);
        await _context.SaveChangesAsync(); // Save to generate SellerProfileId

        // Map and create Address
        var address = _mapper.Map<Address>(request);

        // Map and create StoreInfo (set SellerProfileId before saving)
        var storeInfo = _mapper.Map<StoreInfo>(request);
        storeInfo.CategoryId = categoryId;
        storeInfo.AddressId = address.Id; // Link Address to StoreInfo
        storeInfo.SellerProfileId = sellerProfile.Id; // Set SellerProfileId before saving
        address.StoreInfoId = storeInfo.Id;
        _context.Addresses.Add(address);
        _context.StoreInfos.Add(storeInfo);
        await _context.SaveChangesAsync(); // Save to generate StoreInfoId

        // Update SellerProfile with StoreInfoId
        sellerProfile.StoreInfoId = storeInfo.Id;
        _context.SellerProfiles.Update(sellerProfile);
        await _context.SaveChangesAsync();

        // Link SellerProfile to User
        userToAdd.SellerProfileId = sellerProfile.Id;
        _context.Users.Update(userToAdd);
        await _context.SaveChangesAsync();

        // Link SellerProfileId to SellerTaxInfo
        storeTaxInfo.SellerProfileId = sellerProfile.Id;
        _context.SellerTaxInfos.Update(storeTaxInfo);
        await _context.SaveChangesAsync();

        return Result.Success("Seller registered successfully");
    }

    public async Task ConfirmEmailAsync(ClaimsPrincipal userClaims, string token, HttpContext context)
    {
        var email = userClaims.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value;
        
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        var filePath = Path.Combine(_env.WebRootPath, "ConfirmMessage.html");

        var messageContent = new StringBuilder(await File.ReadAllTextAsync(filePath));

        var link = $"{context.Request.Scheme}://{context.Request.Host}/api/Seller/Account/VerifyToken/{user.Id}/{token}";
        
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

    public async Task<Result> ChangePassword(ChangePassword request)
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

        if (request.NewPassword != request.ConfirmNewPassword)
        {
            return Result.Error("Passwords do not match", 400);
        }
    
        user.Password = HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();
    
        return Result.Success("Password updated successfully");
    }

    public async Task<Result> SendPasswordResetEmailToUserAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        if (user == null)
            return Result.Error("User not found.", 404);
        // Generate a secure token (for demo, use Guid)
        var token = Guid.NewGuid().ToString();
        // Save token to DB or cache (not implemented here)
        var resetLink = $"https://yourdomain.com/reset-password?token={token}";
        await _emailSender.SendPasswordResetEmailAsync(user.Email, user.Name, resetLink);
        return Result.Success("Password reset email sent.");
    }
}
