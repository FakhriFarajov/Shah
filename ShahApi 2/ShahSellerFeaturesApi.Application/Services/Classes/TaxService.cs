using Microsoft.EntityFrameworkCore;
using ShahSellerFeaturesApi.Core.DTOs.Response;
using ShahSellerFeaturesApi.Infrastructure.Contexts;

namespace ShahSellerFeaturesApi.Application.Services.Classes;

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