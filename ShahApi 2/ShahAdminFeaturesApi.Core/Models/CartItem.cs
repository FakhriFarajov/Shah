namespace ShahAdminFeaturesApi.Core.Models
{
    public class CartItem
    {
        public string Id { get; set; } = System.Guid.NewGuid().ToString();
        public int Quantity { get; set; }
        
        public string? BuyerProfileId { get; set; }
        public BuyerProfile? BuyerProfile { get; set; }

        public string ProductVariantId { get; set; } = null!;
        public ProductVariant? ProductVariant { get; set; } = null!;
    }
}
