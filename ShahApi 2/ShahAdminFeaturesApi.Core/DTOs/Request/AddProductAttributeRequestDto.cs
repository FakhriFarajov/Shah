namespace ShahAdminFeaturesApi.Core.DTOs.Request;

public class AddProductAttributeRequestDto
{
    // Server generates a unique GUID for each attribute; clients should not send Ids.
    public string Name { get; set; } = null!;
    public string? CategoryId { get; set; } = null; // ignored by server
}
