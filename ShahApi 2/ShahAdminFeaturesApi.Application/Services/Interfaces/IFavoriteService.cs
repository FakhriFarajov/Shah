using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces
{
    public interface IFavoriteService
    {
        Task AddToFavorites(string buyerId, string productId);
        Task RemoveFromFavorites(string buyerId, string productId);
        Task<bool> IsFavorite(string buyerId, string productId);
        Task<TypedResult<List<object>>> GetAllFavorites(string buyerId);
    }
}

