using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Core.Models;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class ReviewService : IReviewService
{
    private readonly ShahDbContext _context;

    public ReviewService(ShahDbContext context)
    {
        _context = context;
    }
    
    public async Task<TypedResult<List<ReviewResponseDto>>> getAllReviewsOfBuyer(string userId)
    {
        var rows = await _context.Reviews
            .AsNoTracking()
            .Where(r => r.BuyerProfile.UserId == userId)
            .Include(r => r.BuyerProfile).ThenInclude(bp => bp.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var list = rows.Select(MapToDto).ToList();
        return TypedResult<List<ReviewResponseDto>>.Success(list);
    }
    
    public async Task<TypedResult<List<ReviewResponseDto>>> GetReviewsByVariantAsync(string productVariantId)
    {
        var rows = await _context.Reviews
            .AsNoTracking()
            .Where(r => r.ProductVariantId == productVariantId)
            .Include(r => r.BuyerProfile).ThenInclude(bp => bp.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var list = rows.Select(MapToDto).ToList();
        return TypedResult<List<ReviewResponseDto>>.Success(list);
    }

    public async Task<TypedResult<ReviewResponseDto>> GetReviewByIdAsync(string reviewId)
    {
        var r = await _context.Reviews
            .AsNoTracking()
            .Include(rr => rr.BuyerProfile).ThenInclude(bp => bp.User)
            .FirstOrDefaultAsync(rr => rr.Id == reviewId);
        if (r == null) return TypedResult<ReviewResponseDto>.Error("Review not found", 404);
        return TypedResult<ReviewResponseDto>.Success(MapToDto(r));
    }

    public async Task<TypedResult<ReviewResponseDto>> UpdateReviewAsync(string reviewId, UpdateReviewRequestDto request, string buyerProfileId)
    {
        var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId);
        if (review == null) return TypedResult<ReviewResponseDto>.Error("Review not found", 404);
        if (review.BuyerProfileId != buyerProfileId) return TypedResult<ReviewResponseDto>.Error("Forbidden", 403);

        var changed = false;
        if (request.Rating.HasValue && request.Rating.Value >= 1 && request.Rating.Value <= 5)
        {
            review.Rating = request.Rating.Value; changed = true;
        }
        if (request.Comment != null)
        {
            review.Comment = request.Comment; changed = true;
        }
        if (request.Images != null)
        {
            review.Images = request.Images; changed = true;
        }

        if (changed)
        {
            _context.Reviews.Update(review);
            await _context.SaveChangesAsync();
        }

        var r = await _context.Reviews.AsNoTracking().Include(rr => rr.BuyerProfile).ThenInclude(bp => bp.User).FirstOrDefaultAsync(rr => rr.Id == reviewId);
        return TypedResult<ReviewResponseDto>.Success(MapToDto(r!));
    }

    public async Task<TypedResult<object>> DeleteReviewAsync(string reviewId, string buyerProfileId)
    {
        var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId);
        if (review == null) return TypedResult<object>.Error("Review not found", 404);
        if (review.BuyerProfileId != buyerProfileId) return TypedResult<object>.Error("Forbidden", 403);

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        return TypedResult<object>.Success(null!, "Deleted");
    }

    private static ReviewResponseDto MapToDto(Review r)
    {
        return new ReviewResponseDto
        {
            Id = r.Id,
            BuyerProfileId = r.BuyerProfileId,
            BuyerName = r.BuyerProfile != null && r.BuyerProfile.User != null ? (r.BuyerProfile.User.Name + " " + r.BuyerProfile.User.Surname).Trim() : null,
            ProductVariantId = r.ProductVariantId,
            Rating = r.Rating,
            Comment = r.Comment,
            Images = r.Images ?? new List<string>(),
            CreatedAt = r.CreatedAt
        };
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
