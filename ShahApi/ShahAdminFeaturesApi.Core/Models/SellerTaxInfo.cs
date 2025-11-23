namespace ShahAdminFeaturesApi.Core.Models;

public class SellerTaxInfo
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    public string? SellerProfileId { get; set; } = null;
    public SellerProfile? SellerProfile { get; set; } = null;
    
    public Tax Tax { get; set; } // or enum
    public int TaxId { get; set; }
    
    public string TaxNumber { get; set; } = null!;
}