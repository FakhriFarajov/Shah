using Microsoft.AspNetCore.Mvc;
using ShahSellerFeaturesApi.Application.Services.Classes;

namespace ShahSellerFeaturesApi.Presentation.Controllers;


[ApiController]
[Route("api/SellerFeatures/[controller]")]
public class ImageController : ControllerBase
{
    private readonly ImageService _imageService;

    public ImageController(ImageService imageService)
    {
        _imageService = imageService;
    }
    
    [HttpPost("UploadImage")]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
    {
        var result = await _imageService.UploadImageAsync(file);
        return Ok(result);
    }

    [HttpGet("GetImage")]
    public async Task<IActionResult> GetImageUrlAsync(string objectName)
    {
        var result = await _imageService.GetImageUrlAsync(objectName);
        return Ok(result);
    }
}