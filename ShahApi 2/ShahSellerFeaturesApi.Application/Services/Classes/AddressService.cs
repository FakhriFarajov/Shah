using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using ShahSellerFeaturesApi.Core.DTOs.Request;
using ShahSellerFeaturesApi.Core.DTOs.Response;
using ShahSellerFeaturesApi.Core.Models;
using ShahSellerFeaturesApi.Infrastructure.Contexts;

namespace ShahSellerFeaturesApi.Application.Services.Classes;

public class AddressService : IAddressService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;

    public AddressService(ShahDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result> DeleteAddressAsync(string addressId)
    {
        var address = await _context.Addresses.FindAsync(addressId);
        if (address == null)
            return Result.Error("Address not found", 404);

        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();
        return Result.Success("Address deleted successfully");
    }

    public async Task<TypedResult<object>> GetAddressByIdAsync(string addressId)
    {
        var address = await _context.Addresses
            .Include(a => a.Country)
            .FirstOrDefaultAsync(a => a.Id == addressId);
        if (address == null)
            return TypedResult<object>.Error("Address not found", 404);

        return TypedResult<object>.Success(new
        {
            address.Id,
            address.Street,
            address.City,
            address.State,
            address.PostalCode,
            address.CountryId,
            address.Country?.Name,
            address.StoreInfoId,
            address.WarehouseId
        });
    }

    public async Task<TypedResult<object>> GetSellerShopAddressAsync(string buyerId)
    {
        var buyerProfile = await _context.BuyerProfiles.Include(bp => bp.Address).FirstOrDefaultAsync(bp => bp.Id == buyerId);
        if (buyerProfile?.Address == null)
            return TypedResult<object>.Error("Address not found", 404);

        var address = buyerProfile.Address;
        return TypedResult<object>.Success(new
        {
            address.Id,
            address.Street,
            address.City,
            address.State,
            address.PostalCode,
            CountryId = address.CountryId,
            CountryName = address.Country?.Name
        });
    }

    public async Task<Result> EditAddressAsync(EditAddressRequestDTO request)
    {
        if (string.IsNullOrWhiteSpace(request.BuyerId) || string.IsNullOrWhiteSpace(request.AddressId))
            return Result.Error("BuyerId and AddressId are required", 400);

        var buyerProfile = await _context.BuyerProfiles.Include(bp => bp.Address).FirstOrDefaultAsync(b => b.Id == request.BuyerId);
        if (buyerProfile == null)
            return Result.Error("BuyerProfile not found", 404);

        var address = await _context.Addresses.Include(a => a.BuyerProfile).FirstOrDefaultAsync(a => a.Id == request.AddressId);
        if (address == null)
            return Result.Error("Address not found", 404);
        if (address.BuyerProfile == null || address.BuyerProfile.Id != request.BuyerId)
            return Result.Error("Address does not belong to this buyer", 404);

        // Validate CountryId
        var countryExists = await _context.CountryCodes.FirstOrDefaultAsync(c => c.Id == request.CountryId);
        if (countryExists == null)
            return Result.Error("Invalid CountryId", 400);

        _mapper.Map(request, address);
        _context.Addresses.Update(address);
        await _context.SaveChangesAsync();
        return Result.Success("Address updated successfully");
    }


}
