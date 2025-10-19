namespace ShahSellerFeaturesApi.Core.Models;

public class ProductVariantImage
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ImageUrl { get; set; } = null!;
    public string ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;

}