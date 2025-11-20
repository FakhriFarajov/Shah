namespace ShahSellerFeaturesApi.Core.DTOs.Request;

public class EditProductRequestDTO
{
    public string? CategoryId { get; set; }
    public List<EditProductVariantDTO> Variants { get; set; } = new();
}

public class EditProductVariantDTO
{
    public string Id { get; set; } = null!; // existing variant id
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? WeightInGrams { get; set; }
    public int? Stock { get; set; }
    public decimal? Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public List<EditProductImageDTO> Images { get; set; } = new();
}

public class EditProductImageDTO
{
    public string? Id { get; set; } // existing image id; null => new image
    public string? ImageUrl { get; set; }
    public bool? IsMain { get; set; }
    public bool Delete { get; set; } = false;
}

