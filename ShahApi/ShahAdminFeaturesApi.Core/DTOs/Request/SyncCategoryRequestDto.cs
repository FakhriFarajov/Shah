namespace ShahAdminFeaturesApi.Core.DTOs.Request;

public class SyncCategoryItemDto
{
    public string? Id { get; set; }
    public string CategoryName { get; set; } = null!;
    public string? ParentCategoryId { get; set; }
    public List<SyncAttributeItemDto> Attributes { get; set; } = new();
}

public class SyncAttributeItemDto
{
    public string? Id { get; set; }
    public string Name { get; set; } = null!;
    public List<SyncAttributeValueItemDto> Values { get; set; } = new();
}

public class SyncAttributeValueItemDto
{
    public string? Id { get; set; }
    public string Value { get; set; } = null!;
}

