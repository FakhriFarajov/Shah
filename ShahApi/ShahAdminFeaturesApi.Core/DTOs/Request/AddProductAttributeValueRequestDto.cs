namespace ShahAdminFeaturesApi.Core.DTOs.Request;

public class AddProductAttributeValueRequestDto
{
    public string Value { get; set; } = null!;
    public string? ProductAttributeId { get; set; } = null; // optional: if client knows GUID
    public string? ProductAttributeName { get; set; } = null; // optional: map by attribute name within the same request
}
