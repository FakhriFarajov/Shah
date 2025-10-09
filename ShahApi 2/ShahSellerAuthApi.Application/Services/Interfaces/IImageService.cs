using System.Net.Mime;
using Microsoft.AspNetCore.Http;
using ShahSellerAuthApi.Contracts.DTOs.Response;

namespace ShahSellerAuthApi.Application.Services.Interfaces;
public interface IImageService
{
    Task<TypedResult<object>> UploadImageAsync(IFormFile file);
    Task<Stream> DownloadImageAsync(string imagePath);
}