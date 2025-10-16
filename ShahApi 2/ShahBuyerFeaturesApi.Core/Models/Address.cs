using System.ComponentModel.DataAnnotations;

namespace ShahBuyerFeaturesApi.Core.Models
{
    public class Address
    {
        [MaxLength(36)]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string State { get; set; } = null!;
        public string PostalCode { get; set; } = null!;
        public CountryCode Country { get; set; }
        public int CountryId { get; set; }

        public string? BuyerProfileId { get; set; } = null;
        public BuyerProfile? BuyerProfile { get; set; } = null;

        public string? StoreInfoId { get; set; } = null;
        public StoreInfo? StoreInfo { get; set; } = null;
        public string? WarehouseId { get; set; } = null;
        public Warehouse? Warehouse { get; set; } = null;
    }
}
