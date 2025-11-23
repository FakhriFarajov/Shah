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
                o.CreatedAt,
                o.UpdatedAt,
                o.TotalAmount,
                Receipt = o.Receipt != null ? new
                {
                    o.Receipt.Id,
                    File = o.Receipt.File,
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
                    EffectivePrice = (oi.ProductVariant != null && oi.ProductVariant.DiscountPrice > 0 && oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price) ? oi.ProductVariant.DiscountPrice : (oi.ProductVariant != null ? oi.ProductVariant.Price : 0m),
                    LineTotal = oi.Quantity * ((oi.ProductVariant != null && oi.ProductVariant.DiscountPrice > 0 && oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price) ? oi.ProductVariant.DiscountPrice : (oi.ProductVariant != null ? oi.ProductVariant.Price : 0m))
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (order == null)
            return TypedResult<object>.Error("Order not found", 404);

        // AggregateStatusFromItems and aggregate variable removed
        var shaped = new
        {
            order.Id,
            order.CreatedAt,
            order.UpdatedAt,
            order.TotalAmount,
            order.Receipt,
            order.Payment,
            order.Items
        };

        return TypedResult<object>.Success(shaped);
    }

    public async Task<TypedResult<object>> GetOrdersForBuyerAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return TypedResult<object>.Error("userId is required in JWT claims. Please check your token.", 400);

        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return TypedResult<object>.Error($"User not found for id: {userId}", 404);

        var orders = await _context.Orders
            .AsNoTracking()
            .Where(o => o.BuyerProfileId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                o.CreatedAt,
                o.TotalAmount,
                ItemCount = o.OrderItems != null ? o.OrderItems.Count : 0,
                PaymentStatus = o.OrderPayment != null ? o.OrderPayment.Status : PaymentStatus.Pending,
                ReceiptId = o.ReceiptId,
                HasReceipt = o.ReceiptId != null
            })
            .ToListAsync();

        return TypedResult<object>.Success(orders);
    }
    
}
