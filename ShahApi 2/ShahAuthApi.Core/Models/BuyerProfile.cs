namespace ShahAuthApi.Core.Models
{
    public class BuyerProfile
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; } = null!;
        public User User { get; set; } = null!;
        public string? AddressId { get; set; } = null;
        public Address? Address { get; set; } = null;
        public string? ImageProfile { get; set; } = null;
        public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        
        public string? OrderPaymentId { get; set; }
        public OrderPayment? OrderPayment { get; set; }
    }
}
