namespace ShahAdminFeaturesApi.Core.DTOs.Request;

public class AdminSyncProductRequestDTO
{
    public string? CategoryId { get; set; }
    public List<AdminSyncVariantDTO> Variants { get; set; } = new();
}

public class AdminSyncVariantDTO
{
    public string? Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int WeightInGrams { get; set; }
    public int Stock { get; set; }
    public decimal Price { get; set; }
    public List<string> AttributeValueIds { get; set; } = new();
    public List<AdminSyncProductImageDTO> Images { get; set; } = new();
}

public class AdminSyncProductImageDTO
{
    public string? Id { get; set; }
    public string ImageUrl { get; set; } = null!;
    public bool IsMain { get; set; }
}
