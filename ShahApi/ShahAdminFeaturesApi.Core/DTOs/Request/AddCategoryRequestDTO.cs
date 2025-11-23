namespace ShahAdminFeaturesApi.Core.DTOs.Request;

public class AddCategoryRequestDTO
{
    public string CategoryName { get; set; } = null!;
    public string? ParentCategoryId { get; set; }
}

