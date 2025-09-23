using ShahBuyerAuthApi.Contracts.DTOs.Request;
using ShahBuyerAuthApi.Contracts.DTOs.Response;

namespace ShahBuyerAuthApi.Application.Services.Interfaces;

public interface IBuyerService
{
    public Task<string> GetIdByEmailAsync(string email);
    public Task<Result> UpsertBuyerAsync(UpsertBuyerRequestDTO request);
    
}