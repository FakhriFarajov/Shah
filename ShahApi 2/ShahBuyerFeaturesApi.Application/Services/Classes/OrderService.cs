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
                    Images = oi.ProductVariant.Images.Select(i => new { i.ImageUrl, i.IsMain }),
                    LineTotal = oi.ProductVariant.Price * oi.Quantity
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (order == null)
            return TypedResult<object>.Error("Order not found", 404);

        return TypedResult<object>.Success(order);
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
