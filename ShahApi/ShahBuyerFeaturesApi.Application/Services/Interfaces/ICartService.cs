using System.Threading.Tasks;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces
{
    public interface ICartService
    {
        Task AddToCart(string productVariantId, string buyerId);
        Task DeleteFromCart(string productVariantId, string buyerId);
        Task<TypedResult<object>> GetAllCartItems(string buyerId);
        Task IncreaseQuantity(string productVariantId, string buyerId);
        Task DecreaseQuantity(string productVariantId, string buyerId);
        Task DeleteAllCartItems(string buyerId);
    }
}
