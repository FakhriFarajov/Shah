namespace ShahBuyerFeaturesApi.Core.Models
{
    public class Tax
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        
        public string RegexPattern { get; set; } = string.Empty;
        
        public ICollection<SellerTaxInfo> SellerTaxInfos { get; set; } = new List<SellerTaxInfo>();
    }
}
