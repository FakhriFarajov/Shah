namespace ShahAdminAuthApi.Application.Services.Interfaces;
public interface IBuyerService
{
    public Task<string> GetIdByEmailAsync(string email);
}