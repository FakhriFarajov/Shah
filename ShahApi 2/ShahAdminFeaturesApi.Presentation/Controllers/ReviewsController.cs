using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers;


[ApiController] 

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
    
    // GET api/reviews/product/{productId}?page=1&pageSize=20
    [HttpGet("product/{productId}/seller/{sellerProfileId}")]
    public async Task<IActionResult> GetReviewsForProduct(string productId, string sellerProfileId )
    {
        var result = await _reviewService.GetReviewsForProductAsync(productId, sellerProfileId);
        return StatusCode(result.StatusCode, result);
    }
    [HttpGet("getBuyerReviews/{buyerId}")]
    public async Task<IActionResult> GetBuyerReviews(string buyerId)
    {
        var result = await _reviewService.getAllReviewsOfBuyer(buyerId);
        return StatusCode(result.StatusCode, result);
    }
    

    // Update - author only
    [HttpPut("update/{id}/buyer/{buyerId}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateReviewRequestDto request, string buyerId)
    {
        var result = await _reviewService.UpdateReviewAsync(id, request, buyerId);
        return StatusCode(result.StatusCode, result);
    }

    // Delete - author only
    [HttpDelete("delete/{id}/{buyerId}")]
    public async Task<IActionResult> Delete(string id, string buyerId)
    {
        var result = await _reviewService.DeleteReviewAsync(id, buyerId);
        return StatusCode(result.StatusCode, result);
    }
}

