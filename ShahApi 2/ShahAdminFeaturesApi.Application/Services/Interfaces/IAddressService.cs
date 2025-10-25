using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces
{
    public interface IAddressService
    {
        
        Task<Result> DeleteAddressAsync(string id);
        Task<TypedResult<object>>GetAddressByIdAsync(string addressId);
        Task<Result> AddAddressAsync(AddAddressRequestDTO request);
        Task<Result> EditAddressAsync(EditAddressRequestDTO request);
    }
}
