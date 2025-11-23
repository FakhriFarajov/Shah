namespace ShahAdminFeaturesApi.Core.DTOs.Request;

public class AddCategoryWithAttributesRequestDto
{
    public string CategoryName { get; set; } = null!;
    public string? ParentCategoryId { get; set; }
   
    public AttributesAndValuesRequestDto? AttributesAndValues { get; set; } = new AttributesAndValuesRequestDto();
}