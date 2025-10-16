namespace ShahAdminFeaturesApi.Application.Services.Interfaces;
public interface IImageService
{
    Task<TypedResult<object>> UploadImageAsync(IFormFile file);
}