namespace ShahBuyerAuthApi.Core.Models
{
    public class SellerProfile
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; } = null!;
        public User User { get; set; } = null!;

        public string Passport { get; set; }

        public bool IsVerified { get; set; } = false;

        public string? StoreInfoId { get; set; } = null;
        public StoreInfo? StoreInfo { get; set; } = null;

        public string? SellerTaxInfoId { get; set; } = null;
        public SellerTaxInfo? SellerTaxInfo { get; set; } = null;
    }
}

