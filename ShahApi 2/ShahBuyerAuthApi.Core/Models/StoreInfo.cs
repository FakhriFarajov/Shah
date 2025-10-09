namespace ShahBuyerAuthApi.Core.Models
{
    public class StoreInfo
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string StoreName { get; set; } = null!;
        public string? StoreLogoUrl { get; set; } = null;
        public string StoreDescription { get; set; } = null!;
        public string StoreEmail { get; set; } = null!;
        public string StorePhone { get; set; } = null!;
        public string? AddressId { get; set; }
        public Address? Address { get; set; }
        
        public string? SellerProfileId { get; set; }
        public SellerProfile? SellerProfile { get; set; }

        public string? CategoryId { get; set; }
        public Category? Category { get; set; }
        
        public ICollection<Product> Products { get; set; } = new List<Product>();
}
}