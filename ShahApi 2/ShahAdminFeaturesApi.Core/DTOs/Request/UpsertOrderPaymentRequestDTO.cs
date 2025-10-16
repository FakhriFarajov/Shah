namespace ShahAdminFeaturesApi.Core.DTOs.Request;

public record UpsertOrderPaymentRequestDTO(
    string? Id,
    decimal TotalAmount,
    string Currency,
    int Method, // PaymentMethod enum as int
    int Status, // PaymentStatus enum as int
    string GatewayTransactionId,
    decimal? RefundAmount,
    string? RefundReason,
    string? OrderId,
    string BuyerProfileId
);
