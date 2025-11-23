using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Core.Models;
using ShahAdminFeaturesApi.Infrastructure.Contexts;
using static BCrypt.Net.BCrypt;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class AdminService : IAdminService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;

    public AdminService(ShahDbContext context, IMapper mapper)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<string> GetIdByEmailAsync(string email)
    {
        var res =  await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (res == null)
        {
            throw new Exception("Admin not found");
        }
        return res.Id;
    }
    
    public async Task<PaginatedResult<object>> GetAllAdminsAsync(int pageNumber, int pageSize)
    {
        // Guard against invalid paging inputs
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize <= 0) pageSize = 5;
        
        var query = _context.AdminProfiles
            .Include(ap => ap.User)
            .AsNoTracking()
            .Where(ap => ap.User != null);

        var totalItems = await query.CountAsync();

        var admins = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(ap => new
            {
                ap.Id,
                ap.UserId,
                Name = ap.User!.Name,
                Surname = ap.User!.Surname,
                Email = ap.User!.Email,
                Phone = ap.User!.Phone,
                CountryCitizenshipId = ap.User!.CountryCitizenshipId,
                CreatedAt = ap.User!.CreatedAt
            })
            .ToListAsync();

        return PaginatedResult<object>.Success(
            admins,
            totalItems,
            pageNumber,
            pageSize,
            message: "Admins retrieved successfully"
        );
    }
    
    public async Task<TypedResult<object>> GetAdminByIdAsync(string adminId)
    {
        var profile = await _context.AdminProfiles
            .Include(bp => bp.User)
            .FirstOrDefaultAsync(bp => bp.Id == adminId);

        if (profile == null)
            return TypedResult<object>.Error("AdminProfiles not found");
        if (profile.User == null)
            return TypedResult<object>.Error("User not found for this admin profile");
        
        return TypedResult<object>.Success(new
        {
            profile.Id,
            profile.UserId,
            profile.User.Name,
            profile.User.Surname,
            profile.User.Email,
            profile.User.Phone,
            profile.User.CountryCitizenshipId,
            profile.User.CreatedAt,
        }, "Admin profile retrieved successfully");
    }
    
    public async Task<Result> AddAdminAsync(AddAdminRequestDTO dto)
    {
        var admin = _mapper.Map<User>(dto);
        
        // Check for existing email
        var exists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (exists) return Result.Error("Email is already in use");
        
        // Hash the password before saving
        admin.Password = HashPassword(dto.Password);
        
        var adminProfile = _mapper.Map<AdminProfile>(dto);
        adminProfile.UserId = admin.Id;
        admin.AdminProfileId = adminProfile.Id;
        
        _context.Users.Add(admin);
        _context.AdminProfiles.Add(adminProfile);
        await _context.SaveChangesAsync();
        
        return Result.Success("Admin added successfully");
    }

    public async Task<Result> EditAdminAsync(string adminId, EditAdminRequestDTO dto)
    {
        var profile = await _context.AdminProfiles
            .Include(ap => ap.User)
            .FirstOrDefaultAsync(ap => ap.Id == adminId);
        if (profile == null || profile.User == null)
            return Result.Error("Admin profile not found");

        var user = profile.User;

        // Update only provided fields
        if (!string.IsNullOrWhiteSpace(dto.Name)) user.Name = dto.Name;
        if (!string.IsNullOrWhiteSpace(dto.Surname)) user.Surname = dto.Surname;

        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            var exists = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != user.Id);
            if (exists) return Result.Error("Email is already in use");
            user.Email = dto.Email;
        }

        if (!string.IsNullOrWhiteSpace(dto.Phone)) user.Phone = dto.Phone;
        if (dto.CountryCitizenshipId.HasValue) user.CountryCitizenshipId = dto.CountryCitizenshipId.Value;

        await _context.SaveChangesAsync();
        return Result.Success("Admin edited successfully");
    }

    public async Task<Result> DeleteAdminAsync(string adminId)
    {
        var profile = await _context.AdminProfiles
            .Include(ap => ap.User)
            .FirstOrDefaultAsync(ap => ap.Id == adminId);
        if (profile == null)
            return Result.Error("Admin profile not found");

        // Remove User and AdminProfile; ensure order so FK is respected if no cascade
        if (profile.User != null)
        {
            _context.Users.Remove(profile.User);
        }
        _context.AdminProfiles.Remove(profile);

        await _context.SaveChangesAsync();
        return Result.Success("Admin deleted successfully");
    }
    
}