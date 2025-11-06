namespace ShahAdminFeaturesApi.Core.DTOs.Request
{
    public class EditSellerRequestDTO
    {
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? PassportNumber { get; set; }
        public int? CountryCitizenshipId { get; set; }
        public bool? IsVerified { get; set; }
        public string? StoreLogo { get; set; }
        public string? StoreName { get; set; }
        public string? StoreDescription { get; set; }
        public string? StoreContactPhone { get; set; }
        public string? StoreContactEmail { get; set; }
        public int? TaxId { get; set; }
        public string? TaxNumber { get; set; }
        public string? Street { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public int? StoreCountryCodeId { get; set; }
        public string? CategoryId { get; set; }
    }
}
