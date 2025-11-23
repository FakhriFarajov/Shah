using System.ComponentModel.DataAnnotations;

namespace ShahBuyerFeaturesApi.Core.DTOs.Request
{
    public class UpdateReviewRequestDto
    {
        [Range(1,5)]
        public int? Rating { get; set; }

        public string? Comment { get; set; }

        public List<string>? Images { get; set; }
    }
}

