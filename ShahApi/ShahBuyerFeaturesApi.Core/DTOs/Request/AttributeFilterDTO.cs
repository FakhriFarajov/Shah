namespace ShahBuyerFeaturesApi.Core.DTOs.Request
{
    public class AttributeFilterDTO
    {
        public string AttributeId { get; set; } = null!;
        public List<string> ValueIds { get; set; } = new List<string>();
    }
}

