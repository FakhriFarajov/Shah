using ShahAdminAuthApi.Core.Enums;

namespace ShahAdminAuthApi.Core.Models
{
    public class AdminProfile
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string? UserId { get; set; } = null;
        public User? User { get; set; } = null;
        
    }
}