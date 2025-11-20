using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response; // for Obsolete

namespace ShahAdminFeaturesApi.Application.Services.Interfaces
{
    public interface IReviewService
    {
        Task<TypedResult<List<ReviewResponseDto>>> GetReviewsByVariantAsync(string productVariantId);
        Task<TypedResult<ReviewResponseDto>> GetReviewByIdAsync(string reviewId);

        Task<TypedResult<ReviewResponseDto>> UpdateReviewAsync(string reviewId, UpdateReviewRequestDto request,
            string buyerProfileId);

        Task<TypedResult<object>> DeleteReviewAsync(string reviewId, string buyerProfileId);
        Task<TypedResult<List<ReviewResponseDto>>> getAllReviewsOfBuyer(string buyerId);
        Task<TypedResult<object>> GetReviewsForProductAsync(string productId, string sellerProfileId);
    }
}