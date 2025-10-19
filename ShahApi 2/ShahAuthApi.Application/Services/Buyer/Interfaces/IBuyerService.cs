namespace ShahAuthApi.Application.Services.Buyer.Interfaces;
public interface IBuyerService
{
    public Task<string> GetIdByEmailAsync(string email);
}