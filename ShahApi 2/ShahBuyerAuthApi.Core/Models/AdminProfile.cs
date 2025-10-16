using System.ComponentModel.DataAnnotations;

namespace ShahBuyerAuthApi.Core.Models
{
    public class AdminProfile
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        [MaxLength(36)]
        public string? UserId { get; set; } = null;
        public User? User { get; set; } = null;
        
    }
}