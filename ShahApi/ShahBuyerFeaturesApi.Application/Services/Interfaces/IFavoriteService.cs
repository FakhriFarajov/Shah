using System.Collections.Generic;
using System.Threading.Tasks;
using ShahBuyerFeaturesApi.Core.DTOs.Response;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces
{
    public interface IFavoriteService
    {
        // All methods now expect a ProductVariantId (variant identifier) for clarity.
        Task AddToFavorites(string buyerId, string productVariantId);
        Task RemoveFromFavorites(string buyerId, string productVariantId);
        Task<TypedResult<List<object>>> GetAllFavorites(string buyerId);
    }
}
