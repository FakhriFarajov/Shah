namespace ShahAuthApi.Core.Models
{
    public class ProductVariant
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string ProductId { get; set; } = null!;
        public Product Product { get; set; } = null!;

        public int Stock { get; set; }
        public decimal Price { get; set; }

        public ICollection<ProductVariantImage> Images { get; set; } = new List<ProductVariantImage>();

        public ICollection<ProductVariantAttributeValue> ProductVariantAttributeValue { get; set; } =
            new List<ProductVariantAttributeValue>();

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }

}