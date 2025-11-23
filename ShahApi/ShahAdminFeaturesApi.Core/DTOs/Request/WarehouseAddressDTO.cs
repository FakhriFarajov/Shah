namespace ShahAdminFeaturesApi.Core.DTOs.Request
{
    public class WarehouseAddressDTO
    {
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string State { get; set; } = null!;
        public string PostalCode { get; set; } = null!;
        public int CountryId { get; set; }
    }
}

