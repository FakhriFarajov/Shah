using ShahBuyerFeaturesApi.Core.Enums;

namespace ShahBuyerFeaturesApi.Core.DTOs.Request
{
    public class AddAddressRequestDTO
    {
        public string BuyerId { get; set; }
        public string Street { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public int CountryId { get; set; }
        
    }
}