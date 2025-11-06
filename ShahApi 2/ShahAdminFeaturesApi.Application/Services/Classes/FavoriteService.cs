using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Core.Models;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes
{
    public class FavoriteService : IFavoriteService
    {
        private readonly ShahDbContext _context;
        public FavoriteService(ShahDbContext context)
        {
            _context = context;
        }

        public async Task AddToFavorites(string buyerId, string productVariantId)
        {
            var exists = await _context.Favorites.AnyAsync(f => f.BuyerProfileId == buyerId && f.ProductVariantId == productVariantId);
            if (!exists)
            {
                var favorite = new Favorite { BuyerProfileId = buyerId, ProductVariantId = productVariantId };
                _context.Favorites.Add(favorite);
                await _context.SaveChangesAsync();
            }
        }

        public async Task RemoveFromFavorites(string buyerId, string productVariantId)
        {
            var favorite = await _context.Favorites.FirstOrDefaultAsync(f => f.BuyerProfileId == buyerId && f.ProductVariantId == productVariantId);
            if (favorite != null)
            {
                _context.Favorites.Remove(favorite);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> IsFavorite(string buyerId, string productVariantId)
        {
            return await _context.Favorites.AnyAsync(f => f.BuyerProfileId == buyerId && f.ProductVariantId == productVariantId);
        }

        public async Task<TypedResult<List<object>>> GetAllFavorites(string buyerId)
        {
            throw new NotImplementedException();
            // var favorites = await _context.Favorites
            //     .Include(f => f.Product).ThenInclude()
            //     .Where(f => f.BuyerProfileId == buyerId)
            //     .Select(f => new
            //     {
            //         f.Product.Id,
            //         ProductDetails = f.Product == null ? null : new
            //         {
            //             f.Product.Id,
            //             f.Product.ProductDetails.Title,
            //             f.Product.ProductDetails.Description
            //         }
            //     })
            //     .ToListAsync();
            // return TypedResult<List<object>>.Success(favorites.Cast<object>().ToList());
        }
    }
}

