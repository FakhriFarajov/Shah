using System.ComponentModel.DataAnnotations;

namespace ShahAdminFeaturesApi.Core.Models
{
    public class Favorite
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        // Initialize id properties to empty string to avoid null-related crashes before EF sets them
        [MaxLength(36)]
        public string BuyerProfileId { get; set; }
        public virtual BuyerProfile? BuyerProfile { get; set; }

        [MaxLength(36)]
        public string ProductVariantId { get; set; } = string.Empty;
        public virtual ProductVariant? ProductVariant { get; set; }
    }
}
