using System.Net.Mime;
using Microsoft.AspNetCore.Http;
using ShahBuyerFeaturesApi.Contracts.DTOs.Response;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces;
public interface IImageService
{
    Task<TypedResult<object>> UploadImageAsync(IFormFile file);
    
    Task<string> GetImageUrlAsync(string objectName);
}