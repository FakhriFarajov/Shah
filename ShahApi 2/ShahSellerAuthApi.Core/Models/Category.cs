namespace ShahSellerAuthApi.Data.Models
{
    public class Category
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CategoryName { get; set; } = null!;

        public string? ParentCategoryId { get; set; }
        public Category? ParentCategory { get; set; }
        
        public ICollection<Category> SubCategories { get; set; } = new List<Category>();

        public ICollection<Product> Products { get; set; } = new List<Product>();

        public ICollection<ProductAttribute> ProductAttributes { get; set; } = new List<ProductAttribute>();

        public ICollection<StoreInfo> StoreInfos { get; set; } = new List<StoreInfo>();
    }
}