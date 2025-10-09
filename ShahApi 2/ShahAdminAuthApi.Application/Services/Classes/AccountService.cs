using System.Security.Claims;
using System.Text;
using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using ShahAdminAuthApi.Application.Services.Interfaces;
using ShahAdminAuthApi.Contracts.DTOs.Request;
using ShahAdminAuthApi.Contracts.DTOs.Response;
using ShahAdminAuthApi.Core.Enums;
using ShahAdminAuthApi.Core.Models;
using ShahAdminAuthApi.Infrastructure.Contexts;
using static BCrypt.Net.BCrypt;

namespace ShahAdminAuthApi.Application.Services.Classes;


public class AccountService : IAccountService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;
    private readonly IWebHostEnvironment _env;

    public AccountService(ShahDbContext context, IMapper mapper, IWebHostEnvironment env)
    {
        _context = context;
        _mapper = mapper;
        _env = env;
    }
    
    public async Task<Result> RegisterAdminAsync(AdminRegisterRequestDTO request)
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
