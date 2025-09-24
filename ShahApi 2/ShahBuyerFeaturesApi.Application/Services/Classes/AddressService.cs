using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Contracts.DTOs.Request;
using ShahBuyerFeaturesApi.Contracts.DTOs.Response;
using ShahBuyerFeaturesApi.Data.Models;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;

namespace ShahBuyerFeaturesApi.Application.Services.Classes;

public class AddressService : IAddressService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;

    public AddressService(ShahDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result> UpsertAddressAsync(UpsertAddressRequestDTO request)
    {
        if (string.IsNullOrWhiteSpace(request.BuyerId))
            return Result.Error("BuyerId is required", 400);

        var buyerProfile = await _context.BuyerProfiles.FindAsync(request.BuyerId);
        if (buyerProfile == null)
            return Result.Error("BuyerProfile not found", 404);

        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.BuyerProfileId == request.BuyerId);

        if (address != null)
        {
            _mapper.Map(request, address);
            address.BuyerProfileId = request.BuyerId; // Ensure FK is set
            await _context.SaveChangesAsync();
            return Result.Success("Address updated successfully");
        }

        var newAddress = _mapper.Map<Address>(request);
        newAddress.BuyerProfileId = request.BuyerId; // Ensure FK is set
        await _context.Addresses.AddAsync(newAddress);
        await _context.SaveChangesAsync();
        return Result.Success("Address added successfully");
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
        var address = await _context.Addresses.FindAsync(addressId);
        if (address == null)
        {
            throw new Exception("Address not found");
        }

        return TypedResult<object>.Success(new
        {
            address.Id,
            address.Street,
            address.City,
            address.State,
            address.PostalCode,
            address.Country,
            address.BuyerProfileId,
            address.StoreInfoId,
            address.WarehouseId
        });
    }

    public async Task<TypedResult<object>> GetBuyerAddressAsync(string buyerId)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.BuyerProfileId == buyerId);
        if (address == null)
        {
            throw new Exception("Address not found");
        }

        return TypedResult<object>.Success(new
        {
            address.Id,
            address.Street,
            address.City,
            address.State,
            address.PostalCode,
            address.Country,
            address.BuyerProfileId,
            address.StoreInfoId,
            address.WarehouseId
        });
    }
}
