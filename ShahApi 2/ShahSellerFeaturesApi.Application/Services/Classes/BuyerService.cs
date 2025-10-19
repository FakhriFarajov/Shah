using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using ShahSellerFeaturesApi.Core.DTOs.Request;
using ShahSellerFeaturesApi.Core.DTOs.Response;
using ShahSellerFeaturesApi.Infrastructure.Contexts;

namespace ShahSellerFeaturesApi.Application.Services.Classes;

public class SellerService : ISellerService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;
    private readonly IImageService _imageService;
    

    public SellerService(ShahDbContext context, IMapper mapper, IImageService imageService)
    {
        _context = context;
        _mapper = mapper;
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
    
    public async Task<TypedResult<SellerProfileResponseDTO>> GetSellerByIdAsync(string buyerId)
    {
        var profile = await _context.BuyerProfiles
            .Include(bp => bp.User)
            .FirstOrDefaultAsync(bp => bp.Id == buyerId);

        if (profile == null || profile.User == null)
            return TypedResult<SellerProfileResponseDTO>.Error("BuyerProfile or User not found", 404);

        if (profile.User.CountryCitizenshipId != null)
        {
            var country = await _context.CountryCodes
                .FirstOrDefaultAsync(c => c.Id == profile.User.CountryCitizenshipId);
        }

        var url = string.Empty;
        if (profile.ImageProfile != null)
        {
            url = await _imageService.GetImageUrlAsync(profile.ImageProfile);
        }
        
        var dto = new SellerProfileResponseDTO
        {
            Id = profile.Id,
            ImageProfile = url,
            AddressId = profile.AddressId,
            UserId = profile.UserId,
            Email = profile.User.Email,
            Name = profile.User.Name,
            Surname = profile.User.Surname,
            Phone = profile.User.Phone,
            CountryCitizenshipId = profile.User.CountryCitizenshipId,
            createdAt = profile.User.CreatedAt,
        };
        return TypedResult<SellerProfileResponseDTO>.Success(dto, "Buyer retrieved successfully");
    }


    public async Task<Result> EditSellerAsync(string buyerId, EditSellerRequestDTO dto)
    {
        var user = await _context.Users.Include(u => u.BuyerProfile).FirstOrDefaultAsync(u => u.BuyerProfileId == buyerId);
        if (user == null || user.BuyerProfile == null)
            return Result.Error("BuyerProfile not found", 404);

        // Update User fields
        if (!string.IsNullOrWhiteSpace(dto.Name)) user.Name = dto.Name;
        if (!string.IsNullOrWhiteSpace(dto.Surname)) user.Surname = dto.Surname;
        if (!string.IsNullOrWhiteSpace(dto.Email)) user.Email = dto.Email;
        if (!string.IsNullOrWhiteSpace(dto.Phone)) user.Phone = dto.Phone;

        // Update BuyerProfile fields
        if (!string.IsNullOrWhiteSpace(dto.ImageProfile)) user.BuyerProfile.ImageProfile = dto.ImageProfile;
        if (dto.CountryCitizenshipId.HasValue)
            user.CountryCitizenshipId = dto.CountryCitizenshipId.Value;

        await _context.SaveChangesAsync();
        return Result.Success("Buyer edited successfully");
    }
}