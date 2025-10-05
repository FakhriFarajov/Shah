namespace ShahSellerAuthApi.Data.Models;

public class WarehouseOrder
{
    public string Id { get; set; } = Guid.NewGuid().ToString(); // PRIMARY KEY

    public string OrderId { get; set; } = null!;
    public Order Order { get; set; } = null!;

    public string WarehouseId { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ShippedAt { get; set; }
}