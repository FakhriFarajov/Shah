namespace ShahAdminFeaturesApi.Core.DTOs.Request;

public class EditProductVariantRequestDto
{
    public int? Stock { get; set; }
    public decimal? Price { get; set; }
    // If provided, replace the variant's attribute values with this set
    public List<string>? AttributeValueIds { get; set; }
}

