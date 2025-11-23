namespace ShahAdminFeaturesApi.Core.Models
{
    public class Receipt
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public DateTime IssuedAt { get; set; } = DateTime.Now;
        public decimal Amount { get; set; }
        
        public string File { get; set; }
        public Order Order { get; set; } = null!;
    }
}