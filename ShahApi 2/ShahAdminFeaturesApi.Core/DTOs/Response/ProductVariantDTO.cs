namespace ShahAdminFeaturesApi.Core.DTOs.Response;

public class ProductVariantDto
{
    public string Id { get; set; } = null!;
    public string ProductId { get; set; } = null!;
    public int Stock { get; set; }
    public decimal Price { get; set; }
    public decimal DiscountPrice { get; set; }
    public List<ProductVariantAttributeDto> Attributes { get; set; } = new();
}
