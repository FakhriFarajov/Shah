using ShahAdminFeaturesApi.Core.Enums;

namespace ShahAdminFeaturesApi.Core.DTOs.Request
{
    public class EditAddressRequestDTO
    {
        public string BuyerId { get; set; }
        public string AddressId { get; set; }
        public string Street { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public Country Country { get; set; }
    }
}
