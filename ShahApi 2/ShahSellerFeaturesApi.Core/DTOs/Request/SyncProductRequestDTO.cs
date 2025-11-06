namespace ShahSellerFeaturesApi.Core.DTOs.Request;

public class SyncProductRequestDTO
{
    public string? CategoryId { get; set; }
    public List<SyncProductVariantDTO> Variants { get; set; } = new();
}

public class SyncProductVariantDTO
{
    public string? Id { get; set; } // null => create
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int WeightInGrams { get; set; }
    public int Stock { get; set; }
    public decimal Price { get; set; }
    public List<SyncProductImageDTO> Images { get; set; } = new();
    public List<string> AttributeValueIds { get; set; } = new();
}

public class SyncProductImageDTO
{
    public string? Id { get; set; } // null => create
    public string ImageUrl { get; set; } = null!;
    public bool IsMain { get; set; } = false;
}

