using ShahAdminFeaturesApi.Core.Enums;

namespace ShahAdminFeaturesApi.Core.Models
{

    public class OrderPayment
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        // Money
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = "USD";
        
        // Gateway info
        
        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; set; }

        public string GatewayTransactionId { get; set; } // This meeds to be checked carefully 

        // Refund
        public decimal? RefundAmount { get; set; }
        public string? RefundReason { get; set; } = null;

        // Dates
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        
        public string? OrderId { get; set; } // FK to Orders if exists
        public Order Order { get; set; }

        public string BuyerProfileId { get; set; } // Payer (customer)
        public BuyerProfile BuyerProfile { get; set; }
    }
}
