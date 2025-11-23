using Microsoft.EntityFrameworkCore;
using ShahSellerFeaturesApi.Core.DTOs.Response;
using ShahSellerFeaturesApi.Infrastructure.Contexts;

namespace ShahSellerFeaturesApi.Application.Services.Classes;

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
    
    public async Task<TypedResult<object>> GetAttributesWithValuesAsync(string categoryId)
    {
        var exists = await _context.Categories.AsNoTracking().AnyAsync(c => c.Id == categoryId);
        if (!exists)
            return TypedResult<object>.Error("Category not found", 404);

        var data = await _context.ProductAttributes
            .AsNoTracking()
            .Where(a => a.CategoryId == categoryId)
            .Select(a => new
            {
                a.Id,
                a.Name,
                a.CategoryId,
                Values = a.AttributeValues
                    .Select(v => new { v.Id, v.Value })
                    .ToList()
            })
            .ToListAsync();

        return TypedResult<object>.Success(data, "Attributes with values retrieved successfully");
    }

    public async Task<TypedResult<object>> GetAllCategoriesWithAttributesAndValuesAsync()
    {
        var data = await _context.Categories
            .AsNoTracking()
            .Select(c => new
            {
                c.Id,
                c.CategoryName,
                c.ParentCategoryId,
                Attributes = c.ProductAttributes
                    .Select(a => new
                    {
                        a.Id,
                        a.Name,
                        Values = a.AttributeValues
                            .Select(v => new { v.Id, v.Value })
                            .ToList()
                    }).ToList()
            })
            .ToListAsync();

        return TypedResult<object>.Success(data, "Categories with attributes and values retrieved successfully");
    }

}

