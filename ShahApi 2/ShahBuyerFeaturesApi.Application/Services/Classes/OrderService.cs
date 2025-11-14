using Microsoft.EntityFrameworkCore;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;
using ShahBuyerFeaturesApi.Core.Enums;

namespace ShahBuyerFeaturesApi.Application.Services.Classes;

public class OrderService : IOrderService
{
    private readonly ShahDbContext _context;

    public OrderService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<TypedResult<object>> GetOrderByIdAsync(string orderId, string buyerProfileId)
    {
        if (string.IsNullOrWhiteSpace(orderId))
            return TypedResult<object>.Error("orderId is required", 400);
        if (string.IsNullOrWhiteSpace(buyerProfileId))
            return TypedResult<object>.Error("buyerProfileId is required", 400);

        var order = await _context.Orders
            .AsNoTracking()
            .Where(o => o.Id == orderId && o.BuyerProfileId == buyerProfileId)
            .Select(o => new
            {
                o.Id,
                o.Status,
                o.CreatedAt,
                o.UpdatedAt,
                o.TotalAmount,
                Receipt = o.Receipt != null ? new
                {
                    o.Receipt.Id,
                    o.Receipt.FileUrl,
                    o.Receipt.IssuedAt
                } : null,
                Payment = o.OrderPayment != null ? new
                {
                    o.OrderPayment.Id,
                    o.OrderPayment.TotalAmount,
                    o.OrderPayment.Currency,
                    o.OrderPayment.Method,
                    o.OrderPayment.Status,
                    o.OrderPayment.GatewayTransactionId,
                    o.OrderPayment.CreatedAt
                } : null,
                Items = o.OrderItems.Select(oi => new
                {
                    oi.Id,
                    oi.ProductVariantId,
                    Title = oi.ProductVariant.Title,
                    Price = oi.ProductVariant.Price,
                    oi.Quantity,
                    oi.Status,
                    Images = oi.ProductVariant.Images.Select(i => new { i.ImageUrl, i.IsMain }),
                    LineTotal = oi.ProductVariant.Price * oi.Quantity
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (order == null)
            return TypedResult<object>.Error("Order not found", 404);

        // Compute aggregate status from item statuses (client-side)
        OrderStatus AggregateStatusFromItems(IEnumerable<OrderStatus> statuses)
        {
            var list = statuses.ToList();
            if (list.Count == 0) return order.Status; // fallback
            bool anyReturned = list.Contains(OrderStatus.Returned);
            bool anyCancelled = list.Contains(OrderStatus.Cancelled);
            bool allDelivered = list.All(s => s == OrderStatus.Delivered);
            bool anyDelivered = list.Any(s => s == OrderStatus.Delivered);
            bool anyShipped = list.Any(s => s == OrderStatus.Shipped);
            bool anyProcessing = list.Any(s => s == OrderStatus.Processing);
            bool allPending = list.All(s => s == OrderStatus.Pending);

            if (allDelivered) return OrderStatus.Delivered;
            if (anyReturned) return OrderStatus.Returned; // surface returns prominently
            if (anyCancelled && !anyShipped && !anyDelivered && !anyProcessing) return OrderStatus.Cancelled;
            if (anyDelivered || anyShipped) return OrderStatus.Shipped; // treat as at-least shipped
            if (anyProcessing) return OrderStatus.Processing;
            if (allPending) return OrderStatus.Pending;
            return order.Status;
        }

        var aggregate = AggregateStatusFromItems(order.Items.Select(i => (OrderStatus)i.GetType().GetProperty("Status")!.GetValue(i)!));
        var shaped = new
        {
            order.Id,
            order.Status,
            AggregateStatus = aggregate,
            order.CreatedAt,
            order.UpdatedAt,
            order.TotalAmount,
            order.Receipt,
            order.Payment,
            order.Items
        };

        return TypedResult<object>.Success(shaped);
    }

    public async Task<TypedResult<object>> GetOrdersForBuyerAsync(string buyerProfileId)
    {
        if (string.IsNullOrWhiteSpace(buyerProfileId))
            return TypedResult<object>.Error("buyerProfileId is required", 400);

        var orders = await _context.Orders
            .AsNoTracking()
            .Where(o => o.BuyerProfileId == buyerProfileId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                o.Status,
                o.CreatedAt,
                o.TotalAmount,
                ItemCount = o.OrderItems.Count,
                PaymentStatus = o.OrderPayment.Status,
                ReceiptId = o.ReceiptId
            })
            .ToListAsync();

        return TypedResult<object>.Success(orders);
    }
    
}
