using ShahAuthApi.Core.Enums;

namespace ShahAuthApi.Core.Models
{
    public class CountryCode
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Address> Addresses { get; set; } = new List<Address>();
    }
}