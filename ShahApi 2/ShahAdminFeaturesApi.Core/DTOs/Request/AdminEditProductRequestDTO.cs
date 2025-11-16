namespace ShahAdminFeaturesApi.Core.DTOs.Request;

public class AdminEditProductRequestDTO
{
    public string? CategoryId { get; set; }
    public List<AdminEditVariantDTO> Variants { get; set; } = new();
}

public class AdminEditVariantDTO
{
    public string Id { get; set; } = null!;
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? WeightInGrams { get; set; }
    public int? Stock { get; set; }
    public decimal? Price { get; set; }
    public List<AdminEditProductImageDTO>? Images { get; set; }
    public List<string>? AttributeValueIds { get; set; }
}

public class AdminEditProductImageDTO
{
    public string? Id { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsMain { get; set; }
    public bool Delete { get; set; }
}

