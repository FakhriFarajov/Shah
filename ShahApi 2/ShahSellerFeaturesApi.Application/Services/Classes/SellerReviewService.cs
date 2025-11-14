using Microsoft.EntityFrameworkCore;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using ShahSellerFeaturesApi.Core.DTOs.Response;
using ShahSellerFeaturesApi.Infrastructure.Contexts;

namespace ShahSellerFeaturesApi.Application.Services.Classes;

public class SellerReviewService : ISellerReviewService
{
    private readonly ShahDbContext _context;

    public SellerReviewService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<TypedResult<object>> GetReviewsForProductAsync(string productId, string sellerProfileId)
    {
        if (string.IsNullOrWhiteSpace(productId))
            return TypedResult<object>.Error("productId is required", 400);
        if (string.IsNullOrWhiteSpace(sellerProfileId))
            return TypedResult<object>.Error("sellerProfileId is required", 400);

        // Resolve seller store id
        var storeId = await _context.SellerProfiles
            .AsNoTracking()
            .Where(s => s.Id == sellerProfileId)
            .Select(s => s.StoreInfoId)
            .FirstOrDefaultAsync();
        if (string.IsNullOrWhiteSpace(storeId))
            return TypedResult<object>.Error("Seller store not found", 404);

        // Ensure product belongs to this store
        var productOwned = await _context.Products
            .AsNoTracking()
            .AnyAsync(p => p.Id == productId && p.StoreInfoId == storeId);
        if (!productOwned)
            return TypedResult<object>.Error("Product does not belong to this seller", 403);

        // Gather variant ids for the product
        var variantIds = await _context.ProductVariants
            .AsNoTracking()
            .Where(v => v.ProductId == productId)
            .Select(v => v.Id)
            .ToListAsync();
        if (variantIds.Count == 0)
            return TypedResult<object>.Success(new List<object>());

        // Fetch reviews for these variants
        var reviews = await _context.Reviews
            .AsNoTracking()
            .Where(r => variantIds.Contains(r.ProductVariantId))
            .Include(r => r.BuyerProfile).ThenInclude(bp => bp.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.ProductVariantId,
                r.Rating,
                r.Comment,
                r.Images,
                r.CreatedAt,
                r.BuyerProfileId,
                BuyerName = r.BuyerProfile != null && r.BuyerProfile.User != null
                    ? (r.BuyerProfile.User.Name + " " + r.BuyerProfile.User.Surname).Trim()
                    : null
            })
            .ToListAsync();

        return TypedResult<object>.Success(reviews);
    }
}
