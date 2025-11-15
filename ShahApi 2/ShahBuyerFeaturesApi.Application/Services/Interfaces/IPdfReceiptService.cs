using ShahBuyerFeaturesApi.Core.DTOs.Response;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces
{
    public interface IPdfReceiptService
    {
        // Generates a receipt PDF for the given order (owned by buyerProfileId), uploads to MinIO, saves Receipt entity, and returns minimal info
        Task<TypedResult<object>> GenerateAndSaveReceiptAsync(string orderId, string buyerProfileId);
    }
}

