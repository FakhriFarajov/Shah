using System.ComponentModel.DataAnnotations;

namespace ShahAdminFeaturesApi.Core.DTOs.Request
{
    public class CreateReviewRequestDto
    {
        [Required]
        public string ProductVariantId { get; set; } = string.Empty;

        [Required]
        [Range(1,5)]
        public int Rating { get; set; }

        public string? Comment { get; set; }
        
        public List<string>? Images { get; set; }

        // optional image ids or urls can be added later
    }
}
