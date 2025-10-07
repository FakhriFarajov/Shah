namespace ShahBuyerFeaturesApi.Core.Models;

public class ProductDetails
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public float WeightInGrams { get; set; }
    
    public string ProductId { get; set; } = null!;
    public Product Product { get; set; } = null!;

}