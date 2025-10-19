using Microsoft.AspNetCore.Http;
using ShahSellerFeaturesApi.Core.DTOs.Response;

namespace ShahSellerFeaturesApi.Application.Services.Interfaces;
public interface IImageService
{
    Task<TypedResult<object>> UploadImageAsync(IFormFile file);
    
    Task<string> GetImageUrlAsync(string objectName);
}