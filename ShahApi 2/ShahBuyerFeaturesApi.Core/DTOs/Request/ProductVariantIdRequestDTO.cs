using System.ComponentModel.DataAnnotations;

namespace ShahBuyerFeaturesApi.Core.DTOs.Request
{
    public class ProductVariantIdRequestDTO
    {
        [Required]
        public string ProductVariantId { get; set; } = string.Empty;
    }
}

