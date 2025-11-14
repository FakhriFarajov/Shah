using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahSellerFeaturesApi.Application.Services.Interfaces;

namespace ShahSellerFeaturesApi.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SellerPolicy")]
public class ReviewsController : ControllerBase
{
    private readonly ISellerReviewService _sellerReviewService;

    public ReviewsController(ISellerReviewService sellerReviewService)
    {
        _sellerReviewService = sellerReviewService;
    }

    // GET api/reviews/product/{productId}?page=1&pageSize=20
    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetReviewsForProduct(string productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var sellerProfileId = User?.Claims?.FirstOrDefault(c => c.Type == "seller_profile_id")?.Value;
        if (string.IsNullOrWhiteSpace(sellerProfileId))
            return BadRequest("Seller profile not found in token.");

        var result = await _sellerReviewService.GetReviewsForProductAsync(productId, sellerProfileId);
        return StatusCode(result.StatusCode, result);
    }
}

