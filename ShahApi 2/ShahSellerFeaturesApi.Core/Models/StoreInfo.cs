namespace ShahSellerFeaturesApi.Core.Models
{
    public class StoreInfo
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string StoreName { get; set; } = null!;
        public string StoreDescription { get; set; } = null!;
        public string? StoreLogoUrl { get; set; } = null;
        public string StoreEmail { get; set; } = null!;
        public string StorePhone { get; set; } = null!;
        public string? AddressId { get; set; } = null;
        public Address? Address { get; set; } = null;

        public string? SellerProfileId { get; set; } = null;
        public SellerProfile? SellerProfile { get; set; } = null;

        public string? CategoryId { get; set; } = null;
        public Category? Category { get; set; } = null;
        
        public ICollection<Product> Products { get; set; } = new List<Product>();
}
}