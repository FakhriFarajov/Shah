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
    
    public async Task<TypedResult<object>> GetAttributesWithValuesAsync(string categoryId)
    {
        // Collect all parent category IDs (including the selected one)
        var allCategories = await _context.Categories
            .Select(c => new { c.Id, c.ParentCategoryId })
            .ToListAsync();
        var categoryIds = new List<string>();
        string? currentId = categoryId;
        while (!string.IsNullOrWhiteSpace(currentId))
        {
            categoryIds.Add(currentId);
            currentId = allCategories.FirstOrDefault(c => c.Id == currentId)?.ParentCategoryId;
        }

        // Check if the original category exists
        if (!categoryIds.Contains(categoryId))
            return TypedResult<object>.Error("Category not found", 404);

        // Query attributes for all collected category IDs
        var data = await _context.ProductAttributes
            .AsNoTracking()
            .Where(a => categoryIds.Contains(a.CategoryId))
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
}
