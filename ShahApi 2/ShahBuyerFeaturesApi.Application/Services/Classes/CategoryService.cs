using Microsoft.EntityFrameworkCore;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;

namespace ShahBuyerFeaturesApi.Application.Services.Classes;

public class CategoryService
{
    private readonly ShahDbContext _context;
    public CategoryService(ShahDbContext context)
    {
        _context = context;
    }
    public async Task<TypedResult<object>> GetAllCategoriesAsync()
    {
        var categories = await _context.Categories
            .Select(c => new { c.Id, c.CategoryName, c.ParentCategoryId })
            .ToListAsync();
        
        return TypedResult<object>.Success(categories, "Categories retrieved successfully");
    }
}

