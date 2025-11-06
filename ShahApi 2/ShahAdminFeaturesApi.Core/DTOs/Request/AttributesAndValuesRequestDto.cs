namespace ShahAdminFeaturesApi.Core.DTOs.Request;

public class AttributesAndValuesRequestDto
{
    public List<AddProductAttributeRequestDto> Attributes { get; set; } = new List<AddProductAttributeRequestDto>();
    public List<AddProductAttributeValueRequestDto> AttributeValues { get; set; } = new List<AddProductAttributeValueRequestDto>();
}


