
namespace ShahBuyerFeaturesApi.Core.DTOs.Request;
    public class FavoriteListItemDto
    {
        public string RepresentativeVariantId { get; set; } = null!;
        public string? Id { get; set; }
        public string? ProductTitle { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string? MainImage { get; set; }
        public string? StoreName { get; set; }
        public string? CategoryName { get; set; }
        public int ReviewsCount { get; set; }
        public double AverageRating { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsInCart { get; set; }
    }
