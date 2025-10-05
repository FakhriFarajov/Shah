namespace ShahBuyerFeaturesApi.Core.Models
{
    public class OrderItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public int Quantity { get; set; }

        public string OrderId { get; set; } = null!;
        public Order Order { get; set; } = null!;

        public string ProductVariantId { get; set; } = null!;
        public ProductVariant ProductVariant { get; set; } = null!;

    }
}