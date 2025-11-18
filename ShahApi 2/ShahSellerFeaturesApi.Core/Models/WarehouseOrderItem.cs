namespace ShahSellerFeaturesApi.Core.Models;

public class WarehouseOrderItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string WarehouseOrderId { get; set; } = null!;
    public WarehouseOrder WarehouseOrder { get; set; } = null!;
    public string OrderItemId { get; set; } = null!;
    public OrderItem OrderItem { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

