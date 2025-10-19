using ShahBuyerFeaturesApi.Core.Enums;

namespace ShahBuyerFeaturesApi.Core.DTOs.Response
{
    public class BuyerProfileResponseDTO
    {
        public string Id { get; set; }
        public string? ImageProfile { get; set; }
        public string? AddressId { get; set; }
        public string UserId { get; set; }
        public string? Email { get; set; }
        
        public bool IsEmailConfirmed { get; set; }
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? Phone { get; set; }
        public int? CountryCitizenshipId { get; set; }
        public DateTime createdAt { get; set; }
    }
}
