using ShahBuyerFeaturesApi.Core.Enums;

namespace ShahBuyerFeaturesApi.Core.Models
{
    public class Order
    {
        public string Id { get; set; } = System.Guid.NewGuid().ToString();
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public string BuyerProfileId { get; set; }
        public BuyerProfile BuyerProfile { get; set; } = null!;
        // Money
        public decimal TotalAmount { get; set; }
        
        public string? WarehouseOrderId { get; set; } = null;
        public WarehouseOrder? WarehouseOrder { get; set; } = null;
        public string? OrderPaymentId { get; set; } = null;
        public OrderPayment? OrderPayment { get; set; } = null;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public string? ReceiptId { get; set; } = null; // optional FK to Receipt
        public Receipt? Receipt { get; set; } = null;  // optional navigation
    }

}
