namespace ShahBuyerFeaturesApi.Core.DTOs.Response
{
    public class ProductImageDto
    {
        public string Id { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsMain { get; set; }
    }
}

