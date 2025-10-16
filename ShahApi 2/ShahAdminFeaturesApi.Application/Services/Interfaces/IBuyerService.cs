namespace ShahAdminFeaturesApi.Application.Services.Interfaces;
public interface IBuyerService
{
    public Task<string> GetIdByEmailAsync(string email);
    public Task<TypedResult<BuyerProfileResponseDTO>> GetBuyerByIdAsync(string buyerId);
    public Task<Result> EditBuyerAsync(string buyerId, EditBuyerRequestDTO dto);
    
}