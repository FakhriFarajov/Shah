namespace ShahAdminFeaturesApi.Core.Models
{
    public class Product
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public string StoreInfoId { get; set; }
        public StoreInfo StoreInfo { get; set; } = null!;
        public ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();
    }
}