using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces;

public interface IAttributeService
{
    Task<Result> AddAttributeAsync(AddProductAttributeRequestDto dto);
    Task<Result> EditAttributeAsync(string attributeId, EditProductAttributeRequestDto dto);
    Task<Result> DeleteAttributeAsync(string attributeId);

    Task<Result> AddAttributeValueAsync(string attributeId, AddProductAttributeValueRequestDto dto);
    Task<Result> EditAttributeValueAsync(string valueId, EditProductAttributeValueRequestDto dto);
    Task<Result> DeleteAttributeValueAsync(string valueId);
}

