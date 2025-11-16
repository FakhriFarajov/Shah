namespace ShahAdminFeaturesApi.Core.DTOs.Request;

public class AdminCreateProductRequestDTO
{
    public string CategoryId { get; set; } = null!;
    public string StoreInfoId { get; set; } = null!;
    public List<AdminCreateVariantDTO> Variants { get; set; } = new();
}

public class AdminCreateVariantDTO
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int WeightInGrams { get; set; }
    public int Stock { get; set; }
    public decimal Price { get; set; }
    public List<AdminCreateProductImageDTO> Images { get; set; } = new();
    public List<string> AttributeValueIds { get; set; } = new();
}

public class AdminCreateProductImageDTO
{
    public string ImageUrl { get; set; } = null!;
    public bool IsMain { get; set; }
}

