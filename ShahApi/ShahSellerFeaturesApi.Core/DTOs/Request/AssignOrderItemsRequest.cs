namespace ShahSellerFeaturesApi.Core.DTOs.Request;

public class AssignOrderItemsRequest
{
    public IList<string> OrderItemIds { get; set; } = new List<string>();
}
