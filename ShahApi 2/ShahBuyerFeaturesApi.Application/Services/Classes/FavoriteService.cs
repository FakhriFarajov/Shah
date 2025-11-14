using Microsoft.EntityFrameworkCore;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Core.Models;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;
using ShahBuyerFeaturesApi.Core.DTOs.Request;

namespace ShahBuyerFeaturesApi.Application.Services.Classes
{
    public class FavoriteService : IFavoriteService
    {
        private readonly ShahDbContext _context;
        public FavoriteService(ShahDbContext context)
        {
            _context = context;
        }
        
        // Now requires ProductVariantId (variant id) directly from the caller
        public async Task AddToFavorites(string buyerUserId, string productVariantId)
        {
            var exists = await _context.Favorites.AnyAsync(f => f.BuyerProfileId == buyerUserId && f.ProductVariantId == productVariantId);
            if (!exists)
            {
                // Double-check the variant still exists (prevents FK violation if it was deleted concurrently)
                var variantExists = await _context.ProductVariants.AnyAsync(v => v.Id == productVariantId);
                if (!variantExists) return;

                var favorite = new Favorite
                {
                    BuyerProfileId = buyerUserId,
                    ProductVariantId = productVariantId
                };
                _context.Favorites.Add(favorite);
                await _context.SaveChangesAsync();
            }
        }
        
        
        public async Task RemoveFromFavorites(string buyerUserId, string productVariantId)
        {
            // Resolve caller-supplied buyerUserId to the identity user id (BuyerProfiles.UserId)
            var favorite = await _context.Favorites.FirstOrDefaultAsync(f => f.BuyerProfileId == buyerUserId && f.ProductVariantId == productVariantId);
            if (favorite != null)
            {
                _context.Favorites.Remove(favorite);
                await _context.SaveChangesAsync();
            }
         }
        public async Task<TypedResult<List<object>>> GetAllFavorites(string buyerUserId)
        {
             var favorites = await _context.Favorites
               .Where(f => f.BuyerProfileId == buyerUserId)
                 .Select(f => new FavoriteListItemDto
                 {
                        RepresentativeVariantId = f.ProductVariantId,
                     // Use null-safe projections so we don't dereference navigation properties that may be null
                     Id = f.ProductVariant.Product != null ? f.ProductVariant.Product.Id : null,
                     ProductTitle = f.ProductVariant != null ? f.ProductVariant.Title : null,
                     Description = f.ProductVariant != null ? f.ProductVariant.Description : null,
                     Price = f.ProductVariant != null ? f.ProductVariant.Price : 0m,
                     Stock = f.ProductVariant != null ? f.ProductVariant.Stock : 0,
                     MainImage = f.ProductVariant != null
                         ? f.ProductVariant.Images.Where(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()
                         : null,
                     StoreName = f.ProductVariant.Product != null && f.ProductVariant.Product.StoreInfo != null ? f.ProductVariant.Product.StoreInfo.StoreName : null,
                     CategoryName = f.ProductVariant.Product != null && f.ProductVariant.Product.Category != null ? f.ProductVariant.Product.Category.CategoryName : null,
                     ReviewsCount = f.ProductVariant != null ? f.ProductVariant.Reviews.Count : 0,
                     AverageRating = f.ProductVariant != null && f.ProductVariant.Reviews.Any() ? f.ProductVariant.Reviews.Average(r => r.Rating) : 0.0,
                     IsFavorite = true,
                     IsInCart = _context.CartItems.Any(ci => ci.BuyerProfileId == buyerUserId && ci.ProductVariantId == f.ProductVariantId)
                 })
                 .ToListAsync();
             return TypedResult<List<object>>.Success(favorites.Cast<object>().ToList());
         }
    }
 }
