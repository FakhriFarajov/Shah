
namespace ShahAdminFeaturesApi.Core.DTOs.Request
{
    public class EditBuyerRequestDTO
    {
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public int? CountryCitizenshipId { get; set; }
        public string? ImageProfile { get; set; }
    }
}