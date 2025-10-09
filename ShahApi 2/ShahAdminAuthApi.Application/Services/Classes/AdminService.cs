using AutoMapper;
using ShahAdminAuthApi.Application.Services.Interfaces;
using ShahAdminAuthApi.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;
using ShahAdminAuthApi.Contracts.DTOs.Request;
using ShahAdminAuthApi.Contracts.DTOs.Response;
using ShahAdminAuthApi.Core.Models;

namespace ShahAdminAuthApi.Application.Services.Classes;

public class AdminService : IAdminService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;

    public AdminService(ShahDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<string> GetIdByEmailAsync(string email)
    {
        var res =  await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (res == null)
        {
            throw new Exception("Admin not found");
        }
        return res.Id;
    }

}