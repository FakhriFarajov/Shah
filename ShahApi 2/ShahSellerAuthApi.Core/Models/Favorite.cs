    namespace ShahSellerAuthApi.Core.Models
    {
        public class Favorite
        {
            public string Id { get; set; } = System.Guid.NewGuid().ToString();
            public string BuyerProfileId { get; set; } = null!;
            public BuyerProfile BuyerProfile { get; set; } = null!;

            public string ProductId { get; set; } = null!;
            public Product Product { get; set; } = null!;
        }
    }
