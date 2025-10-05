using ShahBuyerAuthApi.Core.Enums;

namespace ShahBuyerAuthApi.Core.Models
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
        public ICollection<Order> Orders { get; set; } = new List<Order>();

        public string BuyerProfileId { get; set; } // Payer (customer)
        public BuyerProfile BuyerProfile { get; set; }
    }
}
