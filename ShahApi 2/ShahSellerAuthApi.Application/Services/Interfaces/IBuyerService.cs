namespace ShahSellerAuthApi.Application.Services.Interfaces;
public interface ISellerService
{
    public Task<string> GetIdByEmailAsync(string email);
}