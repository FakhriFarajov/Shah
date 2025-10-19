using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShahAuthApi.Application.Services.Seller.Interfaces;
using ShahAuthApi.Infrastructure.Contexts;

namespace ShahAuthApi.Application.Services.Seller.Classes;

public class SellerService : ISellerService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;

    public SellerService(ShahDbContext context, IMapper mapper)
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