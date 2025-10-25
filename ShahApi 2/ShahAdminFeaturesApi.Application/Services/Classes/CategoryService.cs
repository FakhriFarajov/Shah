using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class CategoryService
{
    private readonly ShahDbContext _context;
    public CategoryService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<TypedResult<object>> GetAllCategoriesAsync()
    {
        var categories = await _context.Categories.AsNoTracking()
            .Select(c => new { c.Id, c.CategoryName, c.ParentCategoryId })
            .ToListAsync();
        
        return TypedResult<object>.Success(categories, "Categories retrieved successfully");
    }

    public async Task<TypedResult<object>> GetCategoryTreeAsync()
    {
        var cats = await _context.Categories.AsNoTracking()
            .Select(c => new { c.Id, c.CategoryName, c.ParentCategoryId })
            .ToListAsync();

        var nodes = cats.ToDictionary(
            c => c.Id,
            c => new CategoryNodeDto
            {
                Id = c.Id,
                CategoryName = c.CategoryName,
                ParentCategoryId = c.ParentCategoryId,
                Children = new List<CategoryNodeDto>()
            });

        var roots = new List<CategoryNodeDto>();
        foreach (var c in cats)
        {
            if (string.IsNullOrWhiteSpace(c.ParentCategoryId) || !nodes.ContainsKey(c.ParentCategoryId))
            {
                roots.Add(nodes[c.Id]);
            }
            else
            {
                nodes[c.ParentCategoryId].Children.Add(nodes[c.Id]);
            }
        }

        return TypedResult<object>.Success(roots, "Category tree retrieved successfully");
    }

    public async Task<TypedResult<object>> GetChildrenAsync(string parentCategoryId)
    {
        var children = await _context.Categories.AsNoTracking()
            .Where(c => c.ParentCategoryId == parentCategoryId)
            .Select(c => new { c.Id, c.CategoryName, c.ParentCategoryId })
            .ToListAsync();
        return TypedResult<object>.Success(children, "Children retrieved successfully");
    }
    
    public async Task<Result> AddCategoryAsync(string categoryName, string? parentCategoryId)
    {
        if (!string.IsNullOrWhiteSpace(parentCategoryId))
        {
            var parentExists = await _context.Categories.AnyAsync(c => c.Id == parentCategoryId);
            if (!parentExists)
                return Result.Error("Parent category not found");
        }

        var category = new Core.Models.Category
        {
            CategoryName = categoryName,
            ParentCategoryId = parentCategoryId
        };
        
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        
        return Result.Success("Category added successfully");
    }

    public async Task<Result> UpdateCategoryAsync(string id, string? categoryName, string? parentCategoryId)
    {
        var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) return Result.Error("Category not found");

        if (!string.IsNullOrWhiteSpace(categoryName))
            cat.CategoryName = categoryName;

        if (parentCategoryId != null)
        {
            // cannot set parent to itself
            if (parentCategoryId == id)
                return Result.Error("A category cannot be its own parent");
            // if parent provided, ensure it exists and is not a descendant (prevent cycles)
            var parent = await _context.Categories
                .Select(c => new { c.Id, c.ParentCategoryId })
                .FirstOrDefaultAsync(c => c.Id == parentCategoryId);
            if (parent == null)
                return Result.Error("Parent category not found");

            // walk up the chain to ensure we don't hit id
            var walker = parent.ParentCategoryId;
            while (!string.IsNullOrWhiteSpace(walker))
            {
                var key = walker; // avoid captured variable issue in LINQ
                if (key == id)
                    return Result.Error("Invalid parent: would create a cycle");
                var next = await _context.Categories
                    .Where(c => c.Id == key)
                    .Select(c => c.ParentCategoryId)
                    .FirstOrDefaultAsync();
                if (next == null) break;
                walker = next;
            }

            cat.ParentCategoryId = parentCategoryId;
        }

        await _context.SaveChangesAsync();
        return Result.Success("Category updated successfully");
    }

    public async Task<Result> DeleteCategoryAsync(string id)
    {
        var hasChildren = await _context.Categories.AnyAsync(c => c.ParentCategoryId == id);
        if (hasChildren)
            return Result.Error("Cannot delete a category that has subcategories");

        var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) return Result.Error("Category not found");

        _context.Categories.Remove(cat);
        await _context.SaveChangesAsync();
        return Result.Success("Category deleted successfully");
    }

    public async Task<TypedResult<object>> GetProductVariantsAsync(string categoryId, bool includeDescendants = false)
    {
        // collect category ids to search (self + descendants optionally)
        var categoryIds = new HashSet<string> { categoryId };
        if (includeDescendants)
        {
            var all = await _context.Categories
                .AsNoTracking()
                .Select(c => new { c.Id, c.ParentCategoryId })
                .ToListAsync();
            foreach (var id in GetDescendantIds(categoryId, all))
                categoryIds.Add(id);
        }

        // query variants for products in these categories
        var variants = await _context.Products
            .AsNoTracking()
            .Where(p => categoryIds.Contains(p.CategoryId))
            .SelectMany(p => p.ProductVariants)
            .Select(v => new ProductVariantDto
            {
                Id = v.Id,
                ProductId = v.ProductId,
                Stock = v.Stock,
                Price = v.Price,
                Attributes = v.ProductVariantAttributeValue
                    .Select(pvav => new ProductVariantAttributeDto
                    {
                        AttributeName = pvav.ProductAttributeValue.ProductAttribute.Name,
                        AttributeValueId = pvav.ProductAttributeValueId,
                        AttributeValue = pvav.ProductAttributeValue.Value
                    }).ToList()
            })
            .ToListAsync();

        return TypedResult<object>.Success(variants, "Product variants retrieved successfully");
    }

    private static IEnumerable<string> GetDescendantIds(string rootId, IEnumerable<dynamic> flat)
    {
        // flat contains anonymous objects with Id and ParentCategoryId
        var lookup = flat.GroupBy(x => (string?)x.ParentCategoryId)
                         .ToDictionary(g => g.Key, g => g.Select(i => (string)i.Id).ToList());
        var stack = new Stack<string>();
        stack.Push(rootId);
        while (stack.Count > 0)
        {
            var current = stack.Pop();
            if (!lookup.TryGetValue(current, out var children))
                continue;
            foreach (var child in children)
            {
                yield return child;
                stack.Push(child);
            }
        }
    }
}
