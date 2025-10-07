using System.Data;

namespace ShahSellerAuthApi.Data.Models
{
    public class Review
    {
        public string Id { get; set; } = System.Guid.NewGuid().ToString();
        public string BuyerProfileId { get; set; } = null!;
        public BuyerProfile BuyerProfile { get; set; } = null!;
        public string ProductId { get; set; } = null!;
        public Product Product { get; set; } = null!;
        
        public List<string> Images { get; set; } = new List<string>();
        
        public int Rating { get; set; } // 1..5
        public string Comment { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
