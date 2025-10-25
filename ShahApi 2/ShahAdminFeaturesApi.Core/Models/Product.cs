namespace ShahAdminFeaturesApi.Core.Models
{
    public class Product
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        public string ProductDetailsId { get; set; } = null!;
        public ProductDetails ProductDetails { get; set; } = null!;
        
        public string CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public string StoreInfoId { get; set; }
        public StoreInfo StoreInfo { get; set; } = null!;
        
        // Relations with buyers
        public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();

    }
}