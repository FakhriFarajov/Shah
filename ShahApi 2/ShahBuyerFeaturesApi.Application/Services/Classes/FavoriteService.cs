using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Core.Models;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;

namespace ShahBuyerFeaturesApi.Application.Services.Classes
{
    public class FavoriteService 
    {
        private readonly ShahDbContext _context;
        public FavoriteService(ShahDbContext context)
        {
            _context = context;
        }
        //
        // public async Task AddToFavorites(string buyerId, string productId)
        // {
        //     var exists = await _context.Favorites.AnyAsync(f => f.BuyerProfileId == buyerId && f.ProductId == productId);
        //     if (!exists)
        //     {
        //         var favorite = new Favorite { BuyerProfileId = buyerId, ProductId = productId };
        //         _context.Favorites.Add(favorite);
        //         await _context.SaveChangesAsync();
        //     }
        // }
        //
        // public async Task RemoveFromFavorites(string buyerId, string productId)
        // {
        //     var favorite = await _context.Favorites.FirstOrDefaultAsync(f => f.BuyerProfileId == buyerId && f.ProductId == productId);
        //     if (favorite != null)
        //     {
        //         _context.Favorites.Remove(favorite);
        //         await _context.SaveChangesAsync();
        //     }
        // }
        //
        // public async Task<bool> IsFavorite(string buyerId, string productId)
        // {
        //     return await _context.Favorites.AnyAsync(f => f.BuyerProfileId == buyerId && f.ProductId == productId);
        // }
        //
        // public async Task<TypedResult<List<object>>> GetAllFavorites(string buyerId)
        // {
        //     var favorites = await _context.Favorites
        //         .Include(f => f.Product)
        //             .ThenInclude(p => p.ProductDetails)
        //         .Where(f => f.BuyerProfileId == buyerId)
        //         .Select(f => new
        //         {
        //             f.Product.Id,
        //             ProductDetails = f.Product.ProductDetails == null ? null : new
        //             {
        //                 f.Product.ProductDetails.Id,
        //                 f.Product.ProductDetails.Title,
        //                 f.Product.ProductDetails.Description
        //             }
        //         })
        //         .ToListAsync();
        //     return TypedResult<List<object>>.Success(favorites.Cast<object>().ToList());
        // }
    }
}

