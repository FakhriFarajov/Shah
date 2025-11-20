using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Request;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using System.Security.Claims;

namespace ShahBuyerFeaturesApi.Presentation.Controllers;


[ApiController] 
[Authorize(Policy = "BuyerPolicy")] //We need to send a Bearer token in the header to access this endpoint
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    // Public: list reviews for a variant
    [HttpGet("getByVariant/{productVariantId}")]
    public async Task<IActionResult> GetByVariant(string productVariantId)
    {
        var result = await _reviewService.GetReviewsByVariantAsync(productVariantId);
        return StatusCode(result.StatusCode, result);
    }

    // Public: get single review
    [HttpGet("get/{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var result = await _reviewService.GetReviewByIdAsync(id);
        return StatusCode(result.StatusCode, result);
    }
    
    [HttpGet("getBuyerReviews")]
    public async Task<IActionResult> getAllBuyer()
    {
        var buyerId = User.FindFirst("id")?.Value ?? string.Empty;
        var result = await _reviewService.getAllReviewsOfBuyer(buyerId);
        return StatusCode(result.StatusCode, result);
    }

    // Create review - must be buyer
    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequestDto request)
    {
        var buyerId = User.FindFirst("id")?.Value ?? string.Empty;
        var result = await _reviewService.CreateReviewAsync(request, buyerId);
        return StatusCode(result.StatusCode, result);
    }

    // Update - author only
    [HttpPut("update/{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateReviewRequestDto request)
    {
        var buyerId = User.FindFirst("id")?.Value ?? string.Empty;
        var result = await _reviewService.UpdateReviewAsync(id, request, buyerId);
        return StatusCode(result.StatusCode, result);
    }

    // Delete - author only
    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var buyerId = User.FindFirst("id")?.Value ?? string.Empty;
        var result = await _reviewService.DeleteReviewAsync(id, buyerId);
        return StatusCode(result.StatusCode, result);
    }
}

