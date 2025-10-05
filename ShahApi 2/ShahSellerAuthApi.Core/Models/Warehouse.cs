namespace ShahSellerAuthApi.Data.Models
{
    public class Warehouse
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string? AddressId { get; set; }
        public Address? Address { get; set; }

        public ICollection<WarehouseOrder> WarehouseOrder { get; set; } = new List<WarehouseOrder>();
    }
}



