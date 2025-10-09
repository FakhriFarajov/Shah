using ShahAdminAuthApi.Core.Enums;

namespace ShahAdminAuthApi.Core.Models;

public class SellerTaxInfo
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string SellerProfileId { get; set; } = null!;
    public SellerProfile SellerProfile { get; set; } = null!;

    public TaxIdType TaxIdType { get; set; } // or enum
    public string TaxId { get; set; } = null!;
}