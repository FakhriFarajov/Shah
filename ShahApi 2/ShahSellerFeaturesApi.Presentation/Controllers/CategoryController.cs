using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahSellerFeaturesApi.Application.Services.Classes;

namespace ShahSellerFeaturesApi.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly CategoryService _categoryService;
    public CategoryController(CategoryService categoryService)
    {
        _categoryService = categoryService;
    }


    [HttpGet("all")]
    public async Task<IActionResult> GetAllCategories()
    {
        var result = await _categoryService.GetAllCategoriesAsync();
        if (result.IsSuccess)
            return Ok(result.Data);
        return BadRequest(result.Message);
    }
    
    [HttpGet("allWithAttributesAndValues")]
    public async Task<IActionResult> GetAllWithAttributesAndValues()
    {
        var result = await _categoryService.GetAllCategoriesWithAttributesAndValuesAsync();
        if (result.IsSuccess)
            return StatusCode(result.StatusCode, result.Data);
        return StatusCode(result.StatusCode, new { message = result.Message });
    }
}

