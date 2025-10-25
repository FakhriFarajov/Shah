namespace ShahAdminFeaturesApi.Core.DTOs.Response;

public class CategoryNodeDto
{
    public string Id { get; set; } = null!;
    public string CategoryName { get; set; } = null!;
    public string? ParentCategoryId { get; set; }
    public List<CategoryNodeDto> Children { get; set; } = new();
}
