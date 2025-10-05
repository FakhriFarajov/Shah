namespace ShahSellerAuthApi.Data.Models;

public class ProductDetails
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int WeightInGrams { get; set; }
    public int WidthInGrams { get; set; }
    public int HeightInGrams { get; set; }
    public int LengthInGrams { get; set; }
    
    public string ProductId { get; set; } = null!;
    public Product Product { get; set; } = null!;

}