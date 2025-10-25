using Microsoft.AspNetCore.Mvc;
using ShahAdminFeaturesApi.Application.Services.Classes;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers;

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

    [HttpGet("tree")]
    public async Task<IActionResult> GetCategoryTree()
    {
        var result = await _categoryService.GetCategoryTreeAsync();
        if (result.IsSuccess)
            return Ok(result.Data);
        return BadRequest(result.Message);
    }

    [HttpGet("{parentId}/children")]
    public async Task<IActionResult> GetChildren(string parentId)
    {
        var result = await _categoryService.GetChildrenAsync(parentId);
        if (result.IsSuccess)
            return Ok(result.Data);
        return BadRequest(result.Message);
    }

    [HttpPost]
    public async Task<IActionResult> AddCategory([FromBody] AddCategoryRequestDTO dto)
    {
        var result = await _categoryService.AddCategoryAsync(dto.CategoryName, dto.ParentCategoryId);
        if (result.IsSuccess)
            return Ok(result);
        return BadRequest(result.Message);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(string id, [FromBody] UpdateCategoryRequestDTO dto)
    {
        var result = await _categoryService.UpdateCategoryAsync(id, dto.CategoryName, dto.ParentCategoryId);
        if (result.IsSuccess)
            return Ok(result);
        return BadRequest(result.Message);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(string id)
    {
        var result = await _categoryService.DeleteCategoryAsync(id);
        if (result.IsSuccess)
            return Ok(result);
        return BadRequest(result.Message);
    }

    [HttpGet("{id}/variants")]
    public async Task<IActionResult> GetProductVariants(string id, [FromQuery] bool includeDescendants = false)
    {
        var result = await _categoryService.GetProductVariantsAsync(id, includeDescendants);
        if (result.IsSuccess)
            return Ok(result.Data);
        return BadRequest(result.Message);
    }
}
