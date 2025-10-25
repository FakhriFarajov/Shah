using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces;

public interface IVariantService
{
    Task<Result> EditVariantAsync(string variantId, EditProductVariantRequestDto dto);
}

