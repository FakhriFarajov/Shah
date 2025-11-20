namespace ShahAdminFeaturesApi.Core.Models
{
    public class ProductVariant
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string ProductId { get; set; } = null!;
        public Product Product { get; set; } = null!;
        
        public string Title { get; set; } = null!;
        
        public string Description { get; set; } = null!;
        
        public int WeightInGrams { get; set; }
        public int Stock { get; set; }
        public decimal Price { get; set; }
        public decimal DiscountPrice { get; set; }
        public decimal EffectivePrice => (DiscountPrice > 0 && DiscountPrice < Price) ? DiscountPrice : Price;

        public IList<ProductVariantImage> Images { get; set; } = new List<ProductVariantImage>();

        public ICollection<ProductVariantAttributeValue> ProductVariantAttributeValues { get; set; } =
            new List<ProductVariantAttributeValue>();
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        // Relations with buyers
        public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}