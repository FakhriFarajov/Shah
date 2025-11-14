using Microsoft.EntityFrameworkCore;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Request;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Core.Models;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;

namespace ShahBuyerFeaturesApi.Application.Services.Classes;

public class ReviewService : IReviewService
{
    private readonly ShahDbContext _context;

    public ReviewService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<TypedResult<ReviewResponseDto>> CreateReviewAsync(CreateReviewRequestDto request, string buyerProfileId)
    {
        if (string.IsNullOrWhiteSpace(buyerProfileId))
            return TypedResult<ReviewResponseDto>.Error("BuyerProfileId is required");

        // Ensure variant exists
        var variantExists = await _context.ProductVariants.AnyAsync(v => v.Id == request.ProductVariantId);
        if (!variantExists)
            return TypedResult<ReviewResponseDto>.Error("Product variant not found", 404);

        // prevent duplicate: one review per buyer per variant
        var already = await _context.Reviews.AnyAsync(r => r.ProductVariantId == request.ProductVariantId && r.BuyerProfileId == buyerProfileId);
        if (already)
            return TypedResult<ReviewResponseDto>.Error("Review already exists for this product variant by the buyer", 400);
        
        var review = new Review
        {
            BuyerProfileId = buyerProfileId,
            ProductVariantId = request.ProductVariantId,
            Rating = request.Rating,
            Comment = request.Comment ?? string.Empty,
            Images = request.Images ?? new List<string>(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        // Reload with includes to build response
        var persisted = await _context.Reviews
            .AsNoTracking()
            .Include(r => r.BuyerProfile).ThenInclude(bp => bp.User)
            .FirstOrDefaultAsync(r => r.Id == review.Id);

        var dto = MapToDto(persisted!);
        return TypedResult<ReviewResponseDto>.Success(dto);
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
}
