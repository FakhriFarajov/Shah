using Microsoft.AspNetCore.Mvc;
using ShahSellerAuthApi.Application.Services.Classes;

namespace ShahSellerAuthApi.Presentation.Controllers;


[ApiController]
[Route("api/[controller]")]
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

    [HttpOptions("UploadImage")]
    public IActionResult Options()
    {
        Response.Headers.Add("Allow", "POST,OPTIONS");
        return Ok();
    }
}