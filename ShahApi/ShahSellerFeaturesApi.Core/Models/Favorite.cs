    namespace ShahSellerFeaturesApi.Core.Models
    {
        public class Favorite
        {
            public string Id { get; set; } = System.Guid.NewGuid().ToString();
            public string BuyerProfileId { get; set; } = null!;
            public BuyerProfile BuyerProfile { get; set; } = null!;

            public string ProductVariantId { get; set; } = null!;
            public ProductVariant ProductVariant { get; set; } = null!;
        }
    }
