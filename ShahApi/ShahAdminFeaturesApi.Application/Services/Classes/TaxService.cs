using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class TaxService
{
    private readonly ShahDbContext _context;
    public TaxService(ShahDbContext context)
    {
        _context = context;
    }
    public async Task<TypedResult<object>> GetAllTaxesAsync()
    {
        var taxes = await _context.Taxes
            .Select(c => new { c.Id, c.Name, c.RegexPattern })
            .ToListAsync();
        
        return TypedResult<object>.Success(taxes, "Taxes retrieved successfully");
    }
}

