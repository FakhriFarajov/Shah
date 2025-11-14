using ShahSellerFeaturesApi.Core.DTOs.Response;

namespace ShahSellerFeaturesApi.Application.Services.Interfaces;

public interface ISellerReviewService
{
    Task<TypedResult<object>> GetReviewsForProductAsync(string productId, string sellerProfileId);
}