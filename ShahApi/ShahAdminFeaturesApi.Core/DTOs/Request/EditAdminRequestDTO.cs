namespace ShahAdminFeaturesApi.Core.DTOs.Request
{
    public class EditAdminRequestDTO
    {
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public int? CountryCitizenshipId { get; set; }
    }
}

