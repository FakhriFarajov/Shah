namespace ShahAdminFeaturesApi.Core.DTOs.Request
{
    public class AddAdminRequestDTO
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int CountryCitizenshipId { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
    }
}