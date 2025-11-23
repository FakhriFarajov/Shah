namespace ShahAdminFeaturesApi.Core.Models;

public class ProductVariantImage
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ImageUrl { get; set; } = null!;
    public bool IsMain { get; set; } = false;
    public string ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;
}