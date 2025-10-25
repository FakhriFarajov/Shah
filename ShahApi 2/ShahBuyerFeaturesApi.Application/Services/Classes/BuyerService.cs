using Microsoft.EntityFrameworkCore;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Contracts.DTOs.Response;
using ShahBuyerFeaturesApi.Core.DTOs.Request;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;

namespace ShahBuyerFeaturesApi.Application.Services.Classes;

public class BuyerService : IBuyerService
{
    private readonly ShahDbContext _context;
    private readonly ImageService _imageService;
    

    public BuyerService(ShahDbContext context, ImageService imageService)
    {
        _context = context;
        _imageService = imageService;
    }

    public async Task<string> GetIdByEmailAsync(string email)
    {
        var res =  await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (res == null)
        {
            throw new Exception("Buyer not found");
        }
        return res.Id;
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
}