namespace ShahAdminAuthApi.Application.Services.Interfaces;
public interface IAdminService
{
    public Task<string> GetIdByEmailAsync(string email);
}