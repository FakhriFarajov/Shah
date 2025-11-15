using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class AdminOrderService : IAdminOrderService
{
    private readonly ShahDbContext _context;

    public AdminOrderService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<object>> GetOrdersAsync(int page, int pageSize, bool detailed)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        var baseQuery = _context.Orders.AsNoTracking();
        var total = await baseQuery.CountAsync();

        if (!detailed)
        {
            var rows = await baseQuery
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new
                {
                    o.Id,
                    o.CreatedAt,
                    o.TotalAmount,
                    ItemCount = o.OrderItems.Count,
                    PaymentStatus = o.OrderPayment.Status,
                    o.BuyerProfileId,
                    o.ReceiptId
                })
                .ToListAsync();
            return PaginatedResult<object>.Success(rows.Cast<object>(), total, page, pageSize);
        }
        else
        {
            var rows = await baseQuery
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new
                {
                    o.Id,
                    o.CreatedAt,
                    o.UpdatedAt,
                    o.TotalAmount,
                    Buyer = new { o.BuyerProfileId, BuyerName = o.BuyerProfile.User != null ? (o.BuyerProfile.User.Name + " " + o.BuyerProfile.User.Surname).Trim() : null },
                    Receipt = o.Receipt != null ? new { o.Receipt.Id, o.Receipt.FileUrl, o.Receipt.IssuedAt } : null,
                    Payment = o.OrderPayment != null ? new { o.OrderPayment.Id, o.OrderPayment.Status, o.OrderPayment.Method, o.OrderPayment.TotalAmount, o.OrderPayment.Currency } : null,
                    Items = o.OrderItems.Select(oi => new
                    {
                        oi.Id,
                        oi.ProductVariantId, 
                        oi.Status,
                        Title = oi.ProductVariant.Title,
                        Price = oi.ProductVariant.Price,
                        oi.Quantity,
                        LineTotal = oi.ProductVariant.Price * oi.Quantity,
                        Images = oi.ProductVariant.Images.Select(i => new { i.ImageUrl, i.IsMain })
                    }).ToList()
                })
                .ToListAsync();
            return PaginatedResult<object>.Success(rows.Cast<object>(), total, page, pageSize);
        }
    }

    public async Task<TypedResult<object>> GetOrderByIdAsync(string orderId)
    {
        if (string.IsNullOrWhiteSpace(orderId))
            return TypedResult<object>.Error("orderId is required", 400);

        var order = await _context.Orders
            .AsNoTracking()
            .Where(o => o.Id == orderId)
            .Select(o => new
            {
                o.Id,
                o.CreatedAt,
                o.UpdatedAt,
                o.TotalAmount,
                Buyer = new { o.BuyerProfileId, BuyerName = o.BuyerProfile.User != null ? (o.BuyerProfile.User.Name + " " + o.BuyerProfile.User.Surname).Trim() : null },
                Receipt = o.Receipt != null ? new { o.Receipt.Id, o.Receipt.FileUrl, o.Receipt.IssuedAt } : null,
                Payment = o.OrderPayment != null ? new { o.OrderPayment.Id, o.OrderPayment.Status, o.OrderPayment.Method, o.OrderPayment.TotalAmount, o.OrderPayment.Currency } : null,
                Items = o.OrderItems.Select(oi => new
                {
                    oi.Id,
                    oi.ProductVariantId,
                    oi.Status,
                    Title = oi.ProductVariant.Title,
                    Price = oi.ProductVariant.Price,
                    oi.Quantity,
                    LineTotal = oi.ProductVariant.Price * oi.Quantity,
                    Images = oi.ProductVariant.Images.Select(i => new { i.ImageUrl, i.IsMain })
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (order == null) return TypedResult<object>.Error("Order not found", 404);
        return TypedResult<object>.Success(order);
    }
}

