using ShahBuyerFeaturesApi.Core.DTOs.Request;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using System; // for Obsolete

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces
{
    public interface IReviewService
    {
        Task<TypedResult<ReviewResponseDto>> CreateReviewAsync(CreateReviewRequestDto request, string buyerProfileId);
        Task<TypedResult<List<ReviewResponseDto>>> GetReviewsByVariantAsync(string productVariantId);
        Task<TypedResult<ReviewResponseDto>> GetReviewByIdAsync(string reviewId);
        Task<TypedResult<ReviewResponseDto>> UpdateReviewAsync(string reviewId, UpdateReviewRequestDto request, string buyerProfileId);
        Task<TypedResult<object>> DeleteReviewAsync(string reviewId, string buyerProfileId);
        Task<TypedResult<List<ReviewResponseDto>>> getAllReviewsOfBuyer(string buyerId);
    }
}
