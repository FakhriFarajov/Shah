using AutoMapper;
using ShahBuyerAuthApi.Application.Services.Interfaces;
using ShahBuyerAuthApi.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;
using ShahBuyerAuthApi.Contracts.DTOs.Request;
using ShahBuyerAuthApi.Contracts.DTOs.Response;
using ShahBuyerAuthApi.Data.Models;

namespace BuyerService.Application.Services.Classes;

public class BuyerService : IBuyerService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;

    public BuyerService(ShahDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
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
    
    public async Task<Result> UpsertBuyerAsync(UpsertBuyerRequestDTO request)
    {
        var existingBuyer = await _context.BuyerProfiles
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.User.Email == request.Email);

        if (existingBuyer != null)
        {
            // Use AutoMapper to update User from DTO
            _mapper.Map(request, existingBuyer.User);
            // Use AutoMapper to update BuyerProfile from DTO
            _mapper.Map(request, existingBuyer);

            _context.BuyerProfiles.Update(existingBuyer);
            await _context.SaveChangesAsync();
            return Result.Success("Buyer updated successfully");
        }
        else
        {
            var newUser = _mapper.Map<User>(request);
            var newBuyerProfile = _mapper.Map<BuyerProfile>(request);
            newBuyerProfile.User = newUser;
            newBuyerProfile.UserId = newUser.Id;

            _context.Users.Add(newUser);
            _context.BuyerProfiles.Add(newBuyerProfile);
            await _context.SaveChangesAsync();

            return Result.Success("Buyer created successfully");
        }
    }
}