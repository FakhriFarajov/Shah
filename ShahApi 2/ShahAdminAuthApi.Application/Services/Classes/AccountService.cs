using System.Security.Claims;
using System.Text;
using AutoMapper;
using FluentValidation;
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
    private readonly IValidator<AdminRegisterRequestDTO> _validator;

    public AccountService(ShahDbContext context, IMapper mapper, IWebHostEnvironment env, IValidator<AdminRegisterRequestDTO> validator)
    {
        _context = context;
        _mapper = mapper;
        _env = env;
        _validator = validator;
    }
    
    public async Task<Result> RegisterAdminAsync(AdminRegisterRequestDTO request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage));
            return Result.Error($"Validation failed: {errors}", 400);
        }
        // Normalize email to lowercase
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            return Result.Error("Email is already registered.", 409);
        }
        
        var userToAdd = _mapper.Map<User>(request);
        userToAdd.Password = HashPassword(request.Password);
        var adminProfile = _mapper.Map<AdminProfile>(request);
        adminProfile.UserId = userToAdd.Id;
        userToAdd.AdminProfileId = adminProfile.Id;
        _context.AdminProfiles.Add(adminProfile);
        _context.Users.Add(userToAdd);
        await _context.SaveChangesAsync();
        return Result.Success("Admin registered successfully");
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
