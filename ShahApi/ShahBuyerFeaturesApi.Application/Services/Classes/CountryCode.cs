using Microsoft.EntityFrameworkCore;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;

namespace ShahBuyerFeaturesApi.Application.Utils.GetChain;

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