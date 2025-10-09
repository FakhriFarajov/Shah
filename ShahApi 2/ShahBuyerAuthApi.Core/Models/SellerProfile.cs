using System;
using ShahBuyerAuthApi.Core.Enums;

namespace ShahBuyerAuthApi.Core.Models
{
    public class SellerProfile
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; } = null!;
        public User User { get; set; } = null!;
        public bool IsVerified { get; set; } = false;
        public string Passport { get; set; }
        public string StoreInfoId { get; set; }
        public StoreInfo? StoreInfo { get; set; }

        public string SellerTaxInfoId { get; set; }
        public SellerTaxInfo? SellerTaxInfo { get; set; }
    }
}
