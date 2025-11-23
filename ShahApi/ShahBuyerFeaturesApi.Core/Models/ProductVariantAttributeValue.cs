namespace ShahBuyerFeaturesApi.Core.Models;

public class ProductVariantAttributeValue
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    public string ProductVariantId { get; set; } = null!;
    public ProductVariant ProductVariant { get; set; } = null!;

    public string ProductAttributeValueId { get; set; } = null!;
    public ProductAttributeValue ProductAttributeValue { get; set; } = null!;
}
