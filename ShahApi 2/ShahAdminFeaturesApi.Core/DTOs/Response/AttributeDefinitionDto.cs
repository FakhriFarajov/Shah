namespace ShahAdminFeaturesApi.Core.DTOs.Response;

public class AttributeDefinitionDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string CategoryId { get; set; } = null!;
    public List<AttributeValueItemDto> Values { get; set; } = new();
}

public class AttributeValueItemDto
{
    public string Id { get; set; } = null!;
    public string Value { get; set; } = null!;
}

