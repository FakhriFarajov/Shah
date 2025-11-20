using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Core.Enums;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class AdminOrderService : IAdminOrderService
{
    private readonly ShahDbContext _context;

    public AdminOrderService(ShahDbContext context)
    {
        _context = context;
    }

    private async Task<(string? storeId, string? errorMessage, int errorCode)> ResolveSellerStoreAsync(
        string sellerProfileId)
    {
        if (string.IsNullOrWhiteSpace(sellerProfileId))
            return (null, "sellerProfileId is required", 400);
        var storeId = await _context.SellerProfiles
            .AsNoTracking()
            .Where(s => s.Id == sellerProfileId)
            .Select(s => s.StoreInfoId)
            .FirstOrDefaultAsync();
        if (string.IsNullOrWhiteSpace(storeId))
            return (null, "Seller store not found", 404);
        return (storeId, null, 200);
    }
    
    public async Task<PaginatedResult<object>> GetDetailedOrdersForSellerAsync(string sellerProfileId, int page,
        int pageSize)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        if (pageSize > 100) pageSize = 100;
        var (storeId, err, code) = await ResolveSellerStoreAsync(sellerProfileId);
        if (!string.IsNullOrEmpty(err)) return PaginatedResult<object>.Error(err, code);

        var baseQuery = _context.Orders
            .AsNoTracking()
            .Where(o => o.OrderItems.Any(oi => oi.ProductVariant.Product.StoreInfoId == storeId));

        var total = await baseQuery.CountAsync();

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
                Receipt = o.Receipt != null ? new { o.Receipt.Id, File = o.Receipt.File, o.Receipt.IssuedAt } : null,
                Payment = o.OrderPayment != null
                    ? new
                    {
                        o.OrderPayment.Id, o.OrderPayment.Status, o.OrderPayment.Method, o.OrderPayment.TotalAmount,
                        o.OrderPayment.Currency
                    }
                    : null,
                Items = o.OrderItems
                    .Where(oi => oi.ProductVariant.Product.StoreInfoId == storeId)
                    .Select(oi => new
                    {
                        oi.Id,
                        oi.ProductVariantId,
                        Title = oi.ProductVariant.Title,
                        Price = (oi.ProductVariant.DiscountPrice > 0 &&
                                 oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                            ? oi.ProductVariant.DiscountPrice
                            : oi.ProductVariant.Price,
                        oi.Quantity,
                        Status = oi.Status, // Added item-level status
                        LineTotal = ((oi.ProductVariant.DiscountPrice > 0 &&
                                      oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                            ? oi.ProductVariant.DiscountPrice
                            : oi.ProductVariant.Price) * oi.Quantity,
                        Images = oi.ProductVariant.Images.Select(i => new { i.ImageUrl, i.IsMain })
                    }).ToList()
            })
            .ToListAsync();

        return PaginatedResult<object>.Success(rows.Cast<object>(), total, page, pageSize);
    }

    // Admin-wide: list all orders, optional seller filter, detailed or summary
    public async Task<PaginatedResult<object>> GetOrdersAsync(int page, int pageSize, bool detailed = true,
        string? sellerProfileId = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        if (pageSize > 200) pageSize = 200;

        var baseQuery = _context.Orders.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(sellerProfileId))
        {
            baseQuery = baseQuery.Where(o => o.OrderItems
                .Any(oi => oi.ProductVariant.Product.StoreInfo.SellerProfileId == sellerProfileId));
        }

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
                    ItemCount = o.OrderItems.Count(),
                    PaymentStatus = o.OrderPayment.Status,
                    o.ReceiptId,
                    Buyer = o.BuyerProfile != null ? new { o.BuyerProfile.Id, o.BuyerProfile.UserId } : null,
                    Sellers = o.OrderItems
                        .Select(oi => oi.ProductVariant.Product.StoreInfo.SellerProfile)
                        .Where(sp => sp != null)
                        .Select(sp => new { sp.Id, sp.UserId })
                        .Distinct()
                        .ToList()
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
                    Buyer = o.BuyerProfile != null ? new { o.BuyerProfile.Id, o.BuyerProfile.UserId } : null,
                    Sellers = o.OrderItems
                        .Select(oi => oi.ProductVariant.Product.StoreInfo.SellerProfile)
                        .Where(sp => sp != null)
                        .Select(sp => new { sp.Id, sp.UserId })
                        .Distinct()
                        .ToList(),
                    Receipt = o.Receipt != null ? new { o.Receipt.Id, File = o.Receipt.File, o.Receipt.IssuedAt } : null,
                    Payment = o.OrderPayment != null
                        ? new
                        {
                            o.OrderPayment.Id, o.OrderPayment.Status, o.OrderPayment.Method, o.OrderPayment.TotalAmount,
                            o.OrderPayment.Currency
                        }
                        : null,
                    Items = o.OrderItems
                        .Where(oi =>
                            string.IsNullOrWhiteSpace(sellerProfileId) ||
                            oi.ProductVariant.Product.StoreInfo.SellerProfileId == sellerProfileId)
                        .Select(oi => new
                        {
                            oi.Id,
                            oi.ProductVariantId,
                            Title = oi.ProductVariant.Title,
                            Price = (oi.ProductVariant.DiscountPrice > 0 &&
                                     oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                                ? oi.ProductVariant.DiscountPrice
                                : oi.ProductVariant.Price,
                            oi.Quantity,
                            Status = oi.Status,
                            LineTotal = ((oi.ProductVariant.DiscountPrice > 0 &&
                                          oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                                ? oi.ProductVariant.DiscountPrice
                                : oi.ProductVariant.Price) * oi.Quantity,
                            Images = oi.ProductVariant.Images.Select(i => new { i.ImageUrl, i.IsMain })
                        }).ToList()
                })
                .ToListAsync();

            return PaginatedResult<object>.Success(rows.Cast<object>(), total, page, pageSize);
        }
    }

    public async Task<TypedResult<object>> GetOrderByIdForSellerAsync(string orderId, string sellerProfileId)
    {
        var (storeId, err, code) = await ResolveSellerStoreAsync(sellerProfileId);
        if (!string.IsNullOrEmpty(err)) return TypedResult<object>.Error(err, code);
        if (string.IsNullOrWhiteSpace(orderId))
            return TypedResult<object>.Error("orderId is required", 400);

        var order = await _context.Orders
            .AsNoTracking()
            .Where(o => o.Id == orderId && o.OrderItems.Any(oi => oi.ProductVariant.Product.StoreInfoId == storeId))
            .Select(o => new
            {
                o.Id,
                o.CreatedAt,
                o.UpdatedAt,
                o.TotalAmount,
                Receipt = o.Receipt != null ? new { o.Receipt.Id, File = o.Receipt.File, o.Receipt.IssuedAt } : null,
                Payment = o.OrderPayment != null
                    ? new
                    {
                        o.OrderPayment.Id, o.OrderPayment.Status, o.OrderPayment.Method, o.OrderPayment.TotalAmount,
                        o.OrderPayment.Currency
                    }
                    : null,
                Items = o.OrderItems
                    .Where(oi => oi.ProductVariant.Product.StoreInfoId == storeId)
                    .Select(oi => new
                    {
                        oi.Id,
                        oi.ProductVariantId,
                        Title = oi.ProductVariant.Title,
                        Price = (oi.ProductVariant.DiscountPrice > 0 &&
                                 oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                            ? oi.ProductVariant.DiscountPrice
                            : oi.ProductVariant.Price,
                        oi.Quantity,
                        Status = oi.Status, // Added item-level status
                        LineTotal = ((oi.ProductVariant.DiscountPrice > 0 &&
                                      oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                            ? oi.ProductVariant.DiscountPrice
                            : oi.ProductVariant.Price) * oi.Quantity,
                        Images = oi.ProductVariant.Images.Select(i => new { i.ImageUrl, i.IsMain })
                    }).ToList()
            })
            .FirstOrDefaultAsync();

        if (order == null)
            return TypedResult<object>.Error("Order not found for this seller", 404);

        return TypedResult<object>.Success(order);
    }

    // Admin-wide: get order by id without seller check
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
                Receipt = o.Receipt != null ? new { o.Receipt.Id, File = o.Receipt.File, o.Receipt.IssuedAt } : null,
                Payment = o.OrderPayment != null
                    ? new
                    {
                        o.OrderPayment.Id, o.OrderPayment.Status, o.OrderPayment.Method, o.OrderPayment.TotalAmount,
                        o.OrderPayment.Currency
                    }
                    : null,
                Items = o.OrderItems.Select(oi => new
                {
                    oi.Id,
                    oi.ProductVariantId,
                    Title = oi.ProductVariant.Title,
                    Price = (oi.ProductVariant.DiscountPrice > 0 &&
                             oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                        ? oi.ProductVariant.DiscountPrice
                        : oi.ProductVariant.Price,
                    oi.Quantity,
                    Status = oi.Status,
                    LineTotal = ((oi.ProductVariant.DiscountPrice > 0 &&
                                  oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                        ? oi.ProductVariant.DiscountPrice
                        : oi.ProductVariant.Price) * oi.Quantity,
                    Images = oi.ProductVariant.Images.Select(i => new { i.ImageUrl, i.IsMain })
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (order == null)
            return TypedResult<object>.Error("Order not found", 404);

        return TypedResult<object>.Success(order);
    }

    public async Task<TypedResult<object>> SendOrderToWarehouseAsync(string orderId, string sellerProfileId,
        string warehouseId)
    {
        var (storeId, err, code) = await ResolveSellerStoreAsync(sellerProfileId);
        if (!string.IsNullOrEmpty(err)) return TypedResult<object>.Error(err, code);
        if (string.IsNullOrWhiteSpace(orderId))
            return TypedResult<object>.Error("orderId is required", 400);
        if (string.IsNullOrWhiteSpace(warehouseId))
            return TypedResult<object>.Error("warehouseId is required", 400);

        // Ensure warehouse exists and fetch entity
        var warehouse = await _context.Warehouses.FirstOrDefaultAsync(w => w.Id == warehouseId);
        if (warehouse == null)
            return TypedResult<object>.Error("Warehouse not found", 404);

        // Load order with items
        var order = await _context.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.ProductVariant).ThenInclude(pv => pv.Product)
            .FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null)
            return TypedResult<object>.Error("Order not found", 404);

        // Verify seller owns all items in this order
        var sellerHasItems = order.OrderItems.Any(oi => oi.ProductVariant.Product.StoreInfoId == storeId);
        if (!sellerHasItems)
            return TypedResult<object>.Error("Seller not authorized for this order", 403);
        var allItemsBelongToSeller = order.OrderItems.All(oi => oi.ProductVariant.Product.StoreInfoId == storeId);
        if (!allItemsBelongToSeller)
            return TypedResult<object>.Error("Order contains items from other stores; cannot send to warehouse", 409);

        // Ensure not already sent
        var existingWo = await _context.WarehouseOrders.AsNoTracking().FirstOrDefaultAsync(wo => wo.OrderId == orderId);
        if (existingWo != null)
            return TypedResult<object>.Error("Order already sent to warehouse", 409);

        // Calculate total quantity for all items in this order
        var totalQuantity = order.OrderItems.Sum(oi => oi.Quantity);
        if (warehouse.Capacity < totalQuantity)
            return TypedResult<object>.Error("Warehouse does not have enough capacity", 409);

        warehouse.Capacity -= totalQuantity;
        _context.Warehouses.Update(warehouse);

        var warehouseOrder = new Core.Models.WarehouseOrder
        {
            OrderId = order.Id,
            WarehouseId = warehouseId,
            CreatedAt = DateTime.UtcNow
        };
        _context.WarehouseOrders.Add(warehouseOrder);
        order.WarehouseOrderId = warehouseOrder.Id;
        await _context.SaveChangesAsync();

        return TypedResult<object>.Success(
            new { warehouseOrder.Id, warehouseOrder.OrderId, warehouseOrder.WarehouseId, warehouseOrder.CreatedAt },
            "Sent to warehouse");
    }
    
    public async Task<TypedResult<object>> UpdateOrderItemStatusAsync(string orderItemId, OrderStatus newStatus)
    {
        var item = await _context.OrderItems
            .Include(oi => oi.ProductVariant).ThenInclude(pv => pv.Product)
            .Include(oi => oi.Order)
            .FirstOrDefaultAsync(oi => oi.Id == orderItemId);
        if (item == null)
            return TypedResult<object>.Error("OrderItem not found", 404);

        if (item.Status == newStatus)
            return TypedResult<object>.Success(new { item.Id, item.Status }, "No change", 200);
        
        item.Status = newStatus;

        if (item.Order != null)
        {
            item.Order.UpdatedAt = DateTime.UtcNow;
        }
        await _context.SaveChangesAsync();
        return TypedResult<object>.Success(new { item.Id, item.Status }, "Item status updated", 200);
    }

    public async Task<PaginatedResult<object>> GetOrdersByUserIdAsync(string userId, int page, int pageSize)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return PaginatedResult<object>.Error("userId is required", 400);
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        if (pageSize > 200) pageSize = 200;

        var baseQuery = _context.Orders
            .AsNoTracking()
            .Where(o =>
                (o.BuyerProfile != null && o.BuyerProfile.UserId == userId) ||
                o.OrderItems.Any(oi => oi.ProductVariant.Product.StoreInfo.SellerProfile != null && oi.ProductVariant.Product.StoreInfo.SellerProfile.UserId == userId)
            );

        var total = await baseQuery.CountAsync();

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
                Buyer = o.BuyerProfile != null ? new { o.BuyerProfile.Id, o.BuyerProfile.UserId } : null,
                Sellers = o.OrderItems
                    .Select(oi => oi.ProductVariant.Product.StoreInfo.SellerProfile)
                    .Where(sp => sp != null)
                    .Select(sp => new { sp.UserId })
                    .Distinct()
                    .ToList(),
                Receipt = o.Receipt != null ? new { o.Receipt.Id, File = o.Receipt.File, o.Receipt.IssuedAt } : null,
                Payment = o.OrderPayment != null
                    ? new
                    {
                        o.OrderPayment.Id, o.OrderPayment.Status, o.OrderPayment.Method, o.OrderPayment.TotalAmount,
                        o.OrderPayment.Currency
                    }
                    : null,
                Items = o.OrderItems.Select(oi => new
                {
                    oi.Id,
                    oi.ProductVariantId,
                    Title = oi.ProductVariant.Title,
                    Price = (oi.ProductVariant.DiscountPrice > 0 && oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                        ? oi.ProductVariant.DiscountPrice
                        : oi.ProductVariant.Price,
                    oi.Quantity,
                    Status = oi.Status,
                    LineTotal = ((oi.ProductVariant.DiscountPrice > 0 && oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                        ? oi.ProductVariant.DiscountPrice
                        : oi.ProductVariant.Price) * oi.Quantity,
                    Images = oi.ProductVariant.Images.Select(i => new { i.ImageUrl, i.IsMain })
                }).ToList()
            })
            .ToListAsync();

        return PaginatedResult<object>.Success(rows.Cast<object>(), total, page, pageSize);
    }
}
