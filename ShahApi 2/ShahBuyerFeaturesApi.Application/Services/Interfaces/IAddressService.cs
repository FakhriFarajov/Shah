using System.Threading.Tasks;
using ShahBuyerFeaturesApi.Contracts.DTOs.Request;
using ShahBuyerFeaturesApi.Contracts.DTOs.Response;
using ShahBuyerFeaturesApi.Core.DTOs.Request;
using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces
{
    public interface IAddressService
    {
        
        Task<Result> DeleteAddressAsync(string id);
        Task<TypedResult<object>>GetAddressByIdAsync(string addressId);
        Task<TypedResult<object>> GetBuyerAddressAsync(string buyerId);
        Task<Result> AddAddressAsync(AddAddressRequestDTO request);
        Task<Result> EditAddressAsync(EditAddressRequestDTO request);
    }
}
