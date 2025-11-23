using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAdminFeaturesApi.Application.Services.Classes;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers;

[ApiController]
[Authorize(Policy = "AdminPolicy")]
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
            return StatusCode(result.StatusCode, result.Data);
        return StatusCode(result.StatusCode, new { message = result.Message });
    }

    [HttpGet("all-with-attributes")]
    public async Task<IActionResult> GetAllWithAttributesAndValues()
    {
        var result = await _categoryService.GetAllCategoriesWithAttributesAndValuesAsync();
        if (result.IsSuccess)
            return StatusCode(result.StatusCode, result.Data);
        return StatusCode(result.StatusCode, new { message = result.Message });
    }

    [HttpGet("tree")]
    public async Task<IActionResult> GetCategoryTree()
    {
        var result = await _categoryService.GetCategoryTreeAsync();
        if (result.IsSuccess)
            return StatusCode(result.StatusCode, result.Data);
        return StatusCode(result.StatusCode, new { message = result.Message });
    }


    [HttpGet("{id}/getAttributesAndValues")]
    public async Task<IActionResult> GetAttributesWithValues(string id)
    {
        var result = await _categoryService.GetAttributesWithValuesAsync(id);
        if (result.IsSuccess)
            return StatusCode(result.StatusCode, result.Data);
        return StatusCode(result.StatusCode, new { message = result.Message });
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddCategory([FromBody] AddCategoryWithAttributesRequestDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var result = await _categoryService.AddCategoryAsync(
            dto.CategoryName,
            dto.ParentCategoryId,
            dto.AttributesAndValues ?? new AttributesAndValuesRequestDto());
        return StatusCode(result.StatusCode, new { message = result.Message });
    }

    [HttpPut("sync")]
    public async Task<IActionResult> SyncCategories([FromBody] List<SyncCategoryItemDto> items, [FromQuery] bool fullReplace = false)
    {
        if (items == null || items.Count == 0)
            return BadRequest(new { message = "Payload is empty" });
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var result = await _categoryService.SyncCategoriesWithAttributesAsync(items, fullReplace);
        return StatusCode(result.StatusCode, new { message = result.Message });
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteCategory(string id)
    {
        var result = await _categoryService.DeleteCategoryAsync(id);
        return StatusCode(result.StatusCode, new { message = result.Message });
    }

    [HttpGet("{id}/variants")]
    public async Task<IActionResult> GetProductVariants(string id, [FromQuery] bool includeDescendants = false)
    {
        var result = await _categoryService.GetProductVariantsAsync(id, includeDescendants);
        if (result.IsSuccess)
            return StatusCode(result.StatusCode, result.Data);
        return StatusCode(result.StatusCode, new { message = result.Message });
    }

    [HttpDelete("attribute-values/{valueId}")]
    public async Task<IActionResult> DeleteAttributeValue(string valueId)
    {
        var result = await _categoryService.DeleteAttributeValueAsync(valueId);
        return StatusCode(result.StatusCode, new { message = result.Message });
    }
}
