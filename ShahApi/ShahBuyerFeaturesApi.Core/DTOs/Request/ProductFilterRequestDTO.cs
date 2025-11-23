using System.Collections.Generic;

namespace ShahBuyerFeaturesApi.Core.DTOs.Request
{
    public class ProductFilterRequestDTO
    {
        public string? CategoryId { get; set; }
        public bool IncludeChildCategories { get; set; } = false;
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 15;
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public List<string> ValueIds { get; set; } = new(); // Attribute Value IDs only
        public string? UserId { get; set; } // Used to compute IsFavorite and InCart
        
    }
}
