using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using ShahAuthApi.Application.Services.Admin.Interfaces;
using ShahAuthApi.Core.DTOs.AdminDtos.Request;
using ShahAuthApi.Core.DTOs.AdminDtos.Response;
using ShahAuthApi.Core.Enums;
using ShahAuthApi.Core.Models;
using ShahAuthApi.Infrastructure.Contexts;
using static BCrypt.Net.BCrypt;

namespace ShahAuthApi.Application.Services.Admin.Classes;


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
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (existingUser != null)
        {
            return Result.Error("Email is already registered.", 409);
        }

        var userToAdd = _mapper.Map<User>(request);
        userToAdd.Email = normalizedEmail;
        userToAdd.Password = HashPassword(request.Password);
        userToAdd.Role = Role.Admin; // Set role directly

        var adminProfile = _mapper.Map<AdminProfile>(request);
        adminProfile.UserId = userToAdd.Id;

        userToAdd.AdminProfileId = adminProfile.Id;

        _context.Users.Add(userToAdd);
        _context.AdminProfiles.Add(adminProfile);

        await _context.SaveChangesAsync();

        return Result.Success("Admin registered successfully");
    }
}
