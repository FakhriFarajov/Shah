namespace ShahSellerAuthApi.Data.Models
{
    public class ProductAttributeValue
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Value { get; set; } = null!; // e.g., Red, White, XL

        public string ProductAttributeId { get; set; } = null!;
        public ProductAttribute ProductAttribute { get; set; } = null!;
        
        public ICollection<ProductVariantAttributeValue> ProductVariantValues { get; set; } = new List<ProductVariantAttributeValue>();
}
}