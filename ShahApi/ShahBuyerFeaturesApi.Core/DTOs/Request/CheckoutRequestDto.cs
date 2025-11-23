using ShahBuyerFeaturesApi.Core.Enums;

namespace ShahBuyerFeaturesApi.Core.DTOs.Request
{
    public class CheckoutRequestDto
    {
        public string? Currency { get; set; } = "USD";
        // Payment details
        public PaymentMethod? Method { get; set; } = PaymentMethod.CreditCard; // default method
        public string? GatewayTransactionId { get; set; } // external transaction/reference id if already processed
    }
}
