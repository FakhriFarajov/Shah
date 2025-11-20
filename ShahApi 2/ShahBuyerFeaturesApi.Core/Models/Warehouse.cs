using System.ComponentModel.DataAnnotations;

namespace ShahBuyerFeaturesApi.Core.Models
{
    public class Warehouse
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        [MaxLength(36)]
        public string? AddressId { get; set; }
        public Address? Address { get; set; }
        public int Capacity { get; set; } = 0;
        public ICollection<WarehouseOrder> WarehouseOrder { get; set; } = new List<WarehouseOrder>();
        public ICollection<WarehouseOrderItem> WarehouseOrderItems { get; set; } = new List<WarehouseOrderItem>();
    }
}