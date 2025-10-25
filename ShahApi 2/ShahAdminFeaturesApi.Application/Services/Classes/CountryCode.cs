using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class CountryCodeService
{
    private readonly ShahDbContext _context;
    public CountryCodeService(ShahDbContext context)
    {
        _context = context;
    }
    public async Task<TypedResult<object>> GetAllCountryCodesAsync()
    {
        var countries = await _context.CountryCodes
            .Select(c => new { c.Id, c.Name, c.Code })
            .ToListAsync();
        
        return TypedResult<object>.Success(countries, "Countries retrieved successfully");
    }
}