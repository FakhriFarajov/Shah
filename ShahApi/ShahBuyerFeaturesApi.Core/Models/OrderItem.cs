using ShahBuyerFeaturesApi.Core.Enums;

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

        // Per-item status
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public ICollection<WarehouseOrderItem> WarehouseOrderItems { get; set; } = new List<WarehouseOrderItem>();
        public decimal EffectivePrice => (ProductVariant != null && ProductVariant.DiscountPrice > 0 && ProductVariant.DiscountPrice < ProductVariant.Price) ? ProductVariant.DiscountPrice : (ProductVariant != null ? ProductVariant.Price : 0m);
        public decimal LineTotal => Quantity * EffectivePrice;
    }
}