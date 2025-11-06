using ShahSellerFeaturesApi.Core.Models;

namespace ShahSellerFeaturesApi.Core.DTOs.Request;

public class CreateProductRequestDTO
{
    public string CategoryId { get; set; } = null!;
    public string StoreInfoId { get; set; } = null!;
    public List<CreateProductVariantDTO> Variants { get; set; } = new();
}

public class CreateProductVariantDTO
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int WeightInGrams { get; set; }
    public int Stock { get; set; }
    public decimal Price { get; set; }
    public List<CreateProductImageDTO> Images { get; set; } = new();
    public List<string> AttributeValueIds { get; set; } = new();
}

public class CreateProductImageDTO
{
    public string ImageUrl { get; set; } = null!;
    public bool IsMain { get; set; } = false;
}