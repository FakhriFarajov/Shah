namespace ShahAdminFeaturesApi.Core.DTOs.Request;

public class UpdateCategoryWithAttributesRequestDto
{
    public string? CategoryName { get; set; }
    public string? ParentCategoryId { get; set; }

    public List<AttributeDto>? Attributes { get; set; }
    
    public List<AttributeValueDto>? AttributeValues { get; set; }
}

public class AttributeDto
{
    public string AttributeId { get; set; } = null!;
    public string? Name { get; set; }
}

public class AttributeValueDto
{
    public string ValueId { get; set; } = null!;
    public string? Value { get; set; }
}

