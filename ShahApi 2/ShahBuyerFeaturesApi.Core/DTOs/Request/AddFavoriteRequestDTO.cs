using System.ComponentModel.DataAnnotations;

namespace ShahBuyerFeaturesApi.Core.DTOs.Request
{
    public class AddFavoriteRequestDTO
    {
        [Required]
        public string ProductVariantId { get; set; }
    }
    
    public class RemoveFavoriteRequestDTO
    {
        [Required]
        public string ProductVariantId { get; set; }
    }
}
