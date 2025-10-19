namespace ShahAuthApi.Application.Services.Seller.Interfaces;

public interface ISellerService
{
    public Task<string> GetIdByEmailAsync(string email);
}