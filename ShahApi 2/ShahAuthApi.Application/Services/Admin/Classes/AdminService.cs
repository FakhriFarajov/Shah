using Microsoft.EntityFrameworkCore;
using ShahAuthApi.Application.Services.Admin.Interfaces;
using ShahAuthApi.Infrastructure.Contexts;

namespace ShahAuthApi.Application.Services.Admin.Classes;

public class AdminService : IAdminService
{
    private readonly ShahDbContext _context;

    public AdminService(ShahDbContext context)
    {
        _context = context;
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