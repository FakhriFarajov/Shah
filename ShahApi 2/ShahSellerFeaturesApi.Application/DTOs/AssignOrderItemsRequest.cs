namespace ShahSellerFeaturesApi.Application.DTOs;

public class AssignOrderItemsRequest
{
    public IList<string> OrderItemIds { get; set; } = new List<string>();
}
