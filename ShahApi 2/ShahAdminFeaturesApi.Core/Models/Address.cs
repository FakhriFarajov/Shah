using ShahAdminFeaturesApi.Core.Enums;

namespace ShahAdminFeaturesApi.Core.Models
{
    public class Address
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string State { get; set; } = null!;
        public string PostalCode { get; set; } = null!;
        public Country Country { get; set; }

        public string? BuyerProfileId { get; set; } = null;
        public BuyerProfile? BuyerProfile { get; set; } = null;
        
        public string? StoreInfoId { get; set; } = null;
        public StoreInfo? StoreInfo { get; set; } = null;
        public string? WarehouseId { get; set; } = null;
        public Warehouse? Warehouse { get; set; } = null;
    }
}

