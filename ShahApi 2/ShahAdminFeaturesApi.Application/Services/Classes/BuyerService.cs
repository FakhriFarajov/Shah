using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class BuyerService : IBuyerService
{
    private readonly ShahDbContext _context;
    private readonly ImageService _imageService;
    

    public BuyerService(ShahDbContext context, ImageService imageService)
    {
        _context = context;
        _imageService = imageService;
    }

    
    public async Task<TypedResult<object>> GetBuyerByIdAsync(string buyerId)
    {
        var profile = await _context.BuyerProfiles
            .Include(bp => bp.User)
            .FirstOrDefaultAsync(bp => bp.Id == buyerId);

        if (profile == null)
            return TypedResult<object>.Error("BuyerProfile not found");

        if (profile.User == null)
            return TypedResult<object>.Error("Buyer User not found");

        var url = string.Empty;
        if (!string.IsNullOrWhiteSpace(profile.ImageProfile))
        {
            url = await _imageService.GetImageUrlAsync(profile.ImageProfile);
        }

        try
        {
            // Manual mapping (User is present)
            var dto = new BuyerProfileResponseDTO
            {
                Id = profile.Id,
                ImageProfile = url,
                AddressId = profile.AddressId,
                UserId = profile.UserId,
                Email = profile.User.Email,
                IsEmailConfirmed = profile.User.EmailConfirmed,
                Name = profile.User.Name,
                Surname = profile.User.Surname,
                Phone = profile.User.Phone,
                CountryCitizenshipId = profile.User.CountryCitizenshipId,
                createdAt = profile.User.CreatedAt
            };

            return TypedResult<object>.Success(dto, "Buyer retrieved successfully");
        }
        catch (Exception ex)
        {
            return TypedResult<object>.Error($"Mapping error: {ex.Message}");
        }
    }
    public async Task<PaginatedResult<object>> GetAllBuyersAsync(int pageNumber, int pageSize)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize <= 0) pageSize = 5;
        
        var query = _context.BuyerProfiles
            .Include(bp => bp.User)
            .Include(bp => bp.Address)
            .AsNoTracking()
            .Where(bp => bp.User != null);

        var totalItems = await query.CountAsync();

        var buyers = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(bp => new
            {
                bp.Id,
                bp.UserId,
                Name = bp.User!.Name,
                Surname = bp.User!.Surname,
                Email = bp.User!.Email,
                Phone = bp.User!.Phone,
                CountryCitizenshipId = bp.User!.CountryCitizenshipId,
                CreatedAt = bp.User!.CreatedAt,
                AddressId = bp.AddressId,
                Address = bp.Address == null ? null : new
                {
                    bp.Address.Id,
                    bp.Address.Street,
                    bp.Address.City,
                    bp.Address.State,
                    bp.Address.PostalCode,
                    bp.Address.CountryId
                }
            })
            .ToListAsync();

        return PaginatedResult<object>.Success(
            buyers,
            totalItems,
            pageNumber,
            pageSize,
            message: "Buyers retrieved successfully"
        );
    }
    
    
    public async Task<Result> EditBuyerAsync(string buyerId, EditBuyerRequestDTO dto)
    {
        var user = await _context.Users.Include(u => u.BuyerProfile).FirstOrDefaultAsync(u => u.BuyerProfileId == buyerId);
        if (user == null || user.BuyerProfile == null)
            return Result.Error("BuyerProfile not found");

        // Update User fields
        if (!string.IsNullOrWhiteSpace(dto.Name)) user.Name = dto.Name;
        if (!string.IsNullOrWhiteSpace(dto.Surname)) user.Surname = dto.Surname;

        // Handle email: validate uniqueness before updating
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            var existing = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Id != user.Id);
            if (existing != null)
            {
                return Result.Error("Email is already in use");
            }
            user.Email = dto.Email;
        }

        if (!string.IsNullOrWhiteSpace(dto.Phone)) user.Phone = dto.Phone;

        // Update BuyerProfile fields
        if (!string.IsNullOrWhiteSpace(dto.ImageProfile))
        {
            user.BuyerProfile.ImageProfile = dto.ImageProfile;
        }

        if (dto.CountryCitizenshipId.HasValue)
            user.CountryCitizenshipId = dto.CountryCitizenshipId.Value;
        
        await _context.SaveChangesAsync();
        
        return Result.Success("Buyer edited successfully");
    }
    
    
    
    public async Task<Result> DeleteBuyerAsync(string buyerId)
    {
        var buyerProfile = await _context.BuyerProfiles
            .Include(bp => bp.User)
            .Include(bp => bp.Address)
            .FirstOrDefaultAsync(bp => bp.Id == buyerId);

        if (buyerProfile == null)
            return Result.Error("BuyerProfile not found", 404);

        // Also delete the associated Address if present
        if (buyerProfile.Address != null)
        {
            _context.Addresses.Remove(buyerProfile.Address);
        }

        // Also delete the associated User
        if (buyerProfile.User != null)
        {
            _context.Users.Remove(buyerProfile.User);
        }

        _context.BuyerProfiles.Remove(buyerProfile);
        await _context.SaveChangesAsync();

        return Result.Success("Buyer deleted successfully");
    }
}