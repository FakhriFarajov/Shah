using System.ComponentModel.DataAnnotations;
using ShahSellerFeaturesApi.Core.Enums;

namespace ShahSellerFeaturesApi.Core.Models
{
    public class User
    {
        [MaxLength(36)]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public bool EmailConfirmed { get; set; } = false;
        public string Phone { get; set; }
        
        public int CountryCitizenshipId { get; set; }
        public CountryCode CountryCitizenship { get; set; }
        public string Password { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public string? BuyerProfileId { get; set; } = null;
        public BuyerProfile? BuyerProfile { get; set; } = null;

        public string? SellerProfileId { get; set; } = null;
        public SellerProfile? SellerProfile { get; set; } = null;
        
        public string? AdminProfileId { get; set; } = null;
        public AdminProfile? AdminProfile { get; set; } = null;
        

        public string? RefreshToken { get; set; } = null;
        public DateTime? RefreshTokenExpiryTime { get; set; } = DateTime.UtcNow;
        
        public Role Role { get; set; }
    }
}
