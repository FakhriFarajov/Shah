using ShahSellerAuthApi.Data.Models;

namespace ShahSellerAuthApi.Data.Models
{
    public class CartItem
    {
        public string Id { get; set; } = System.Guid.NewGuid().ToString();
        public int Quantity { get; set; }
        
        public string BuyerProfileId { get; set; } = null!;
        public BuyerProfile BuyerProfile { get; set; } = null!;
        public string ProductId { get; set; } = null!;
        public Product Product { get; set; } = null!;
        public string ProductVariantId { get; set; } = null!;
        public ProductVariant ProductVariant { get; set; } = null!;
    }
}
