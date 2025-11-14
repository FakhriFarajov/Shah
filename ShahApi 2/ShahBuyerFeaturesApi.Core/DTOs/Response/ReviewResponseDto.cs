using System;
using System.Collections.Generic;

namespace ShahBuyerFeaturesApi.Core.DTOs.Response
{
    public class ReviewResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string BuyerProfileId { get; set; } = string.Empty;
        public string? BuyerName { get; set; }
        public string ProductVariantId { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public List<string> Images { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; }
    }
}

