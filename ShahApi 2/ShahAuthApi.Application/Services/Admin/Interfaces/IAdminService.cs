namespace ShahAuthApi.Application.Services.Admin.Interfaces;
public interface IAdminService
{
    public Task<string> GetIdByEmailAsync(string email);
}