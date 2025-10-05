using AutoMapper;
using ShahSellerAuthApi.Application.Services.Interfaces;
using ShahSellerAuthApi.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;

namespace ShahSellerAuthApi.Application.Services.Classes;

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