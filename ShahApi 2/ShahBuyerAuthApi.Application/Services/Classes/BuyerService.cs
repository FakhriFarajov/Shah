using AutoMapper;
using ShahBuyerAuthApi.Application.Services.Interfaces;
using ShahBuyerAuthApi.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;
using ShahBuyerAuthApi.Contracts.DTOs.Request;
using ShahBuyerAuthApi.Contracts.DTOs.Response;
using ShahBuyerAuthApi.Data.Models;

namespace ShahBuyerAuthApi.Application.Services.Classes;

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

}