using System.Collections.Generic;

namespace ShahBuyerFeaturesApi.Core.DTOs.Response
{
    public class VariantDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public List<ProductImageDto> Images { get; set; } = new List<ProductImageDto>();
        public List<string> SiblingVariantIds { get; set; } = new List<string>();
        public List<object>? Attributes { get; set; }
        public List<object>? Reviews { get; set; }
        public int ReviewsCount { get; set; }
        public double AverageRating { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsInCart { get; set; }
    }
}

