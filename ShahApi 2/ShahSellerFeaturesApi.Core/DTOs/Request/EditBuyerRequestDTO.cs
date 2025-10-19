namespace ShahSellerFeaturesApi.Core.DTOs.Request
{
    public class EditSellerRequestDTO
    {
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public int? CountryCitizenshipId { get; set; }
        public string? ImageProfile { get; set; }
    }
}
