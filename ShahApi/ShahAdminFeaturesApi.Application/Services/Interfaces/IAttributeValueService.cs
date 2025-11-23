using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces;

public interface IAttributeValueService
{
    Task<Result> AddAttributeValueAsync(string attributeId, AddProductAttributeValueRequestDto dto);
    Task<Result> EditAttributeValueAsync(string valueId, EditProductAttributeValueRequestDto dto);
    Task<Result> DeleteAttributeValueAsync(string valueId);
}

