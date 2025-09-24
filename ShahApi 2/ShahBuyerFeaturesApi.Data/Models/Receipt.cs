using System;
using ShahBuyerFeaturesApi.Data.Models;

namespace ShahBuyerFeaturesApi.Data.Models
{
    public class Receipt
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public DateTime IssuedAt { get; set; } = DateTime.Now;
        public decimal Amount { get; set; }
        
        public string FileUrl { get; set; }

        public string OrderId { get; set; }
        public Order Order { get; set; } = null!;
    }
}