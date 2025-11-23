namespace ShahSellerFeaturesApi.Core.Models
{
    public class ProductAttribute
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = null!; // e.g., Color, Size

        public string CategoryId { get; set; } = null!;
        public Category Category { get; set; } = null!;

        public ICollection<ProductAttributeValue> AttributeValues { get; set; } = new List<ProductAttributeValue>();
    }
}