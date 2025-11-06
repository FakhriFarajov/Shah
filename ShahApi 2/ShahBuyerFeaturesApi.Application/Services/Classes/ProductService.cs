using Microsoft.EntityFrameworkCore;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Application.Utils.GetChain;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Core.Models;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;

namespace ShahBuyerFeaturesApi.Application.Services.Classes;

public class ProductService : IProductService
{
    private readonly ShahDbContext _context;

    public ProductService(ShahDbContext context)
    {
        _context = context;
    }
    public async Task<PaginatedResult<object>> GetAllPaginatedProductAsync(string? storeId = null, int page = 1, int pageSize = 5,
        string? categoryId = null, bool includeChildCategories = true)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 15;

        // Build a base query with filters only (no Includes) for accurate counting
        var baseQuery = _context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(storeId))
            baseQuery = baseQuery.Where(p => p.StoreInfoId == storeId);

        if (!string.IsNullOrWhiteSpace(categoryId))
        {
            var categoryIds = new HashSet<string> { categoryId! };
            if (includeChildCategories)
            {
                var all = await _context.Categories
                    .AsNoTracking()
                    .Select(c => new { c.Id, c.ParentCategoryId })
                    .ToListAsync();
                foreach (var id in GetDescendantIds(categoryId!, all))
                    categoryIds.Add(id);
            }
            baseQuery = baseQuery.Where(p => categoryIds.Contains(p.CategoryId));
        }


        // Accurate total count after filters
        var total = await baseQuery.CountAsync();

        // Now build the data query with needed Includes
        var query = baseQuery
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Reviews)
            .Include(p => p.StoreInfo)
            .Include(p => p.Category).ThenInclude(c => c.ParentCategory);

        var pageRows = await query
            .OrderBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                ProductTitle = p.ProductVariants.Select(v => v.Title).FirstOrDefault(),
                StoreName = p.StoreInfo.StoreName,
                Price = p.ProductVariants.Select(v => (decimal?)v.Price).Min() ?? 0m,
                Category = p.Category,
                ReviewsCount = p.ProductVariants.Sum(v => v.Reviews.Count)
            })
            .ToListAsync();

        // Fetch main images for these products in one go
        var productIds = pageRows.Select(r => r.Id).ToList();
        var mains = await _context.ProductVariantImages
            .Where(img => img.IsMain && productIds.Contains(img.ProductVariant.ProductId))
            .Select(img => new { img.ProductVariant.ProductId, img.ImageUrl })
            .ToListAsync();
        var mainLookup = mains
            .GroupBy(x => x.ProductId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.ImageUrl).FirstOrDefault());

        var items = pageRows
            .Select(p => new
            {
                p.Id,
                p.ProductTitle,
                MainImage = mainLookup.TryGetValue(p.Id, out var url) ? url : null,
                p.StoreName,
                p.Price,
                CategoryName = p.Category.CategoryName,
                CategoryChain = CategoryUtils.GetCategoryChain(p.Category),
                p.ReviewsCount
            })
            .Cast<object>()
            .ToList();

        return PaginatedResult<object>.Success(items, total, page, pageSize);
    }

    public async Task<PaginatedResult<object>> GetRandomProductsAsync(int page = 1, int pageSize = 45)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 15;

        var totalItems = await _context.Products.CountAsync();
        if (totalItems == 0)
        {
            return PaginatedResult<object>.Success(Enumerable.Empty<object>(), 0, page, pageSize);
        }

        var randomPageRows = await _context.Products
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Reviews)
            .Include(p => p.StoreInfo)
            .Include(p => p.Category).ThenInclude(c => c.ParentCategory)
            .OrderBy(p => Guid.NewGuid())
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                ProductTitle = p.ProductVariants.Select(v => v.Title).FirstOrDefault(),
                StoreName = p.StoreInfo.StoreName,
                Price = p.ProductVariants.Select(v => (decimal?)v.Price).Min() ?? 0m,
                Category = p.Category,
                ReviewsCount = p.ProductVariants.Sum(v => v.Reviews.Count)
            })
            .ToListAsync();

        var productIds = randomPageRows.Select(r => r.Id).ToList();
        var mains = await _context.ProductVariantImages
            .Where(img => img.IsMain && productIds.Contains(img.ProductVariant.ProductId))
            .Select(img => new { img.ProductVariant.ProductId, img.ImageUrl })
            .ToListAsync();
        var mainLookup = mains
            .GroupBy(x => x.ProductId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.ImageUrl).FirstOrDefault());

        var items = randomPageRows
            .Select(p => new
            {
                p.Id,
                p.ProductTitle,
                MainImage = mainLookup.TryGetValue(p.Id, out var url) ? url : null,
                p.StoreName,
                p.Price,
                CategoryName = p.Category.CategoryName,
                CategoryChain = CategoryUtils.GetCategoryChain(p.Category),
                p.ReviewsCount
            })
            .Cast<object>()
            .ToList();

        return PaginatedResult<object>.Success(items, totalItems, page, pageSize);
    }
    
    private static IEnumerable<string> GetDescendantIds(string rootId, IEnumerable<dynamic> flat)
    {
        var lookup = flat
            .Where(x => !string.IsNullOrWhiteSpace((string?)x.ParentCategoryId))
            .GroupBy(x => (string)x.ParentCategoryId)
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
