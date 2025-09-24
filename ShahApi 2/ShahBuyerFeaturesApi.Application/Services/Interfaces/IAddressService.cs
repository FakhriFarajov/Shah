using System.Threading.Tasks;
using ShahBuyerFeaturesApi.Contracts.DTOs.Request;
using ShahBuyerFeaturesApi.Contracts.DTOs.Response;
using ShahBuyerFeaturesApi.Data.Models;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces
{
    public interface IAddressService
    {
        Task<Result> DeleteAddressAsync(string id);
        Task<Result> UpsertAddressAsync(UpsertAddressRequestDTO request); 
        Task<TypedResult<object>>GetAddressByIdAsync(string addressId);
        Task<TypedResult<object>> GetBuyerAddressAsync(string buyerId);
    }
}
