using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahBuyerFeaturesApi.Application.Services.Classes;

namespace ShahBuyerFeaturesApi.Presentation.Controllers;


[ApiController]
[Route("api/BuyerFeatures/[controller]")]
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