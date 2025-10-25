using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using ShahSellerFeaturesApi.Core.DTOs.Request;
using ShahSellerFeaturesApi.Core.DTOs.Response;
using ShahSellerFeaturesApi.Infrastructure.Contexts;
using System.Text.RegularExpressions;

namespace ShahSellerFeaturesApi.Application.Services.Classes;

public class SellerService : ISellerService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;
    private readonly ImageService _imageService;


    public SellerService(ShahDbContext context, IMapper mapper, ImageService imageService)
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
            throw new Exception("Seller not found");
        }
        return res.Id;
    }
    
    public async Task<TypedResult<object>> GetSellerByIdAsync(string sellerId)
    {
        var profile = await _context.SellerProfiles
            .Include(sp => sp.User)
            .Include(sp => sp.StoreInfo)
                .ThenInclude(si => si.Address)
            .Include(sp => sp.SellerTaxInfo)
            .FirstOrDefaultAsync(sp => sp.Id == sellerId);

        if (profile == null)
            return TypedResult<object>.Error("SellerProfile not found", 404);

        // Map using AutoMapper
        var dto = _mapper.Map<SellerProfileResponseDTO>(profile);

        // Replace StoreLogo with URL if present
        var storeInfo = profile.StoreInfo;
        if (storeInfo != null && !string.IsNullOrWhiteSpace(storeInfo.StoreLogo))
        {
            dto.StoreLogo = await _imageService.GetImageUrlAsync(storeInfo.StoreLogo);
        }

        return TypedResult<object>.Success(dto, "Seller retrieved successfully");
    }

    public async Task<Result> EditSellerAsync(string sellerId, EditSellerRequestDTO dto)
    {
        var profile = await _context.SellerProfiles
            .Include(sp => sp.User)
            .Include(sp => sp.StoreInfo)
                .ThenInclude(si => si.Address)
            .Include(sp => sp.SellerTaxInfo)
            .FirstOrDefaultAsync(sp => sp.Id == sellerId);
        if (profile == null || profile.User == null)
            return Result.Error("SellerProfile not found", 404);

        var user = profile.User;

        // Create or update nested objects via AutoMapper
        if (profile.StoreInfo == null)
        {
            profile.StoreInfo = _mapper.Map<Core.Models.StoreInfo>(dto);
        }
        else
        {
            _mapper.Map(dto, profile.StoreInfo);
        }

        if (profile.SellerTaxInfo == null)
        {
            profile.SellerTaxInfo = _mapper.Map<Core.Models.SellerTaxInfo>(dto);
        }
        else
        {
            _mapper.Map(dto, profile.SellerTaxInfo);
        }

        if (profile.StoreInfo.Address == null)
        {
            profile.StoreInfo.Address = _mapper.Map<Core.Models.Address>(dto);
        }
        else
        {
            _mapper.Map(dto, profile.StoreInfo.Address);
        }

        _mapper.Map(dto, user);
        
        
        // Removed: passport updates are managed by Admin API
        // if (!string.IsNullOrWhiteSpace(dto.PassportNumber))
        // {
        //     profile.Passport = dto.PassportNumber;
        // }

        var storeInfo = profile.StoreInfo;
        var taxInfo = profile.SellerTaxInfo;
        var address = profile.StoreInfo.Address;
        
        // Handle StoreLogo: persist object name only. If a full URL is provided, extract the object name from it.
        if (!string.IsNullOrWhiteSpace(dto.StoreLogo))
        {
            string ExtractObjectName(string input)
            {
                // If already looks like an object name (no scheme), return as-is
                if (!Uri.IsWellFormedUriString(input, UriKind.Absolute)) return input.Trim();
                try
                {
                    var uri = new Uri(input);
                    // uri.AbsolutePath is like /bucket/object or /bucket/path/to/object
                    var path = uri.AbsolutePath.Trim('/');
                    // If bucket is configured, strip it if present at the start
                    // We can't access configuration here, so heuristically remove the first segment
                    var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
                    if (segments.Length == 0) return input;
                    // If path starts with a bucket name, object name is the rest
                    return segments.Length == 1 ? segments[0] : string.Join('/', segments.Skip(1));
                }
                catch
                {
                    return input.Trim();
                }
            }
            var objectName = ExtractObjectName(dto.StoreLogo);
            storeInfo.StoreLogo = objectName;
        }

        // Attach entities if they were newly created
        if (string.IsNullOrWhiteSpace(profile.StoreInfoId) && storeInfo != null)
        {
            profile.StoreInfo = storeInfo;
            profile.StoreInfoId = storeInfo.Id;
        }
        if (string.IsNullOrWhiteSpace(profile.SellerTaxInfoId) && taxInfo != null)
        {
            profile.SellerTaxInfo = taxInfo;
            profile.SellerTaxInfoId = taxInfo.Id;
        }
        if (string.IsNullOrWhiteSpace(storeInfo.AddressId) && address != null)
        {
            storeInfo.Address = address;
            storeInfo.AddressId = address.Id;
        }

        // Mark entities as modified (context tracking should pick up changes, but ensure add when necessary)
        if (_context.Entry(user).State == EntityState.Detached)
            _context.Users.Update(user);
        if (_context.Entry(storeInfo).State == EntityState.Detached)
            _context.StoreInfos.Update(storeInfo);
        if (_context.Entry(taxInfo).State == EntityState.Detached)
            _context.SellerTaxInfos.Update(taxInfo);
        if (_context.Entry(address).State == EntityState.Detached)
            _context.Addresses.Update(address);

        await _context.SaveChangesAsync();
        return Result.Success("Seller edited successfully");
    }

}