using System.Threading.Tasks;
using ShahBuyerFeaturesApi.Contracts.DTOs.Request;
using ShahBuyerFeaturesApi.Contracts.DTOs.Response;
using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces
{
    public interface ICartService
    {
        Task AddToCart(string productId, string productVariantId,string buyerId);
        Task DeleteFromCart(string productId, string productVariantId,string buyerId);
        Task<TypedResult<object>> GetAllCartItems(string buyerId);
        Task IncreaseQuantity(string productId, string productVariantId, string buyerId);
        Task DecreaseQuantity(string productId, string productVariantId,string buyerId);
        Task DeleteAllCartItems(string buyerId);
    }
}
