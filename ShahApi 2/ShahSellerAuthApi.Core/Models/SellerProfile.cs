using System;
using ShahSellerAuthApi.Data.Enums;

namespace ShahSellerAuthApi.Data.Models
{
    public class SellerProfile
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; } = null!;
        public User User { get; set; } = null!;
        
        public string Passport { get; set; }

        public bool IsVerified { get; set; } = false;

        public string StoreInfoId { get; set; }
        public StoreInfo StoreInfo { get; set; }

        public string SellerTaxInfoId { get; set; }
        public SellerTaxInfo SellerTaxInfo { get; set; }
    }
}
