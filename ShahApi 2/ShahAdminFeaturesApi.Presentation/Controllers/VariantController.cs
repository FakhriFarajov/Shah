using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminPolicy")]
public class VariantController : ControllerBase
{
    private readonly IVariantService _variantService;
    public VariantController(IVariantService variantService)
    {
        _variantService = variantService;
    }

    [HttpPut("{variantId}")]
    public async Task<IActionResult> EditVariantAsync(string variantId, [FromBody] EditProductVariantRequestDto dto)
    {
        var result = await _variantService.EditVariantAsync(variantId, dto);
        if (result.IsSuccess)
            return Ok(result);
        return BadRequest(result.Message);
    }
}

