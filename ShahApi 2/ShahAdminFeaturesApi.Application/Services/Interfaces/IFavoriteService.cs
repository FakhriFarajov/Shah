using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces
{
    public interface IFavoriteService
    {
        Task AddToFavorites(string buyerId, string productVariantId);
        Task RemoveFromFavorites(string buyerId, string productVariantId);
        Task<bool> IsFavorite(string buyerId, string productVariantId);
        Task<TypedResult<List<object>>> GetAllFavorites(string buyerId);
    }
}
