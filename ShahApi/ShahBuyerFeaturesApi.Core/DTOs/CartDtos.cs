namespace ShahBuyerFeaturesApi.Core.DTOs;

public class CartListItemDto
{
    public string Id { get; set; } = null!;
    public ProductDto? Product { get; set; }
    public ProductVariantDto ProductVariant { get; set; } = null!;
    public int Quantity { get; set; }
}

public class ProductDto
{
    public string? Id { get; set; }
    public string? StoreName { get; set; }
    public string? CategoryName { get; set; }
}

public class ProductVariantDto
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public decimal DiscountPrice { get; set; }
    public int Stock { get; set; }
    public List<AttributeDto> Attributes { get; set; } = new();
    public List<ImageDto> Images { get; set; } = new();
    public int ReviewsCount { get; set; }
    public double AverageRating { get; set; }
}

public class AttributeDto
{
    public string Name { get; set; } = null!;
    public string Value { get; set; } = null!;
}

public class ImageDto
{
    public string ImageUrl { get; set; } = null!;
    public bool IsMain { get; set; }
}

