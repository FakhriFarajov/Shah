using System.Threading.Tasks;
using ShahBuyerAuthApi.Contracts.DTOs.Request;
using ShahBuyerAuthApi.Contracts.DTOs.Response;
using ShahBuyerAuthApi.Data.Models;

namespace ShahBuyerAuthApi.Application.Services.Interfaces
{
    public interface IAddressService
    {
        Task<Result> DeleteAddressAsync(string id);
        Task<Result> UpsertAddressAsync(UpsertAddressRequestDTO request); 
        Task<TypedResult<object>>GetAddressByIdAsync(string addressId);
        Task<TypedResult<object>> GetBuyerAddressAsync(string buyerId);
    }
}
