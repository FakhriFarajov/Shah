using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Infrastructure.Contexts;
using Address = ShahAdminFeaturesApi.Core.Models.Address;
using Warehouse = ShahAdminFeaturesApi.Core.Models.Warehouse;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class WarehouseService : IWarehouseService
{
    private readonly ShahDbContext _context;

    public WarehouseService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<TypedResult<object>> GetWarehouseByIdAsync(string warehouseId)
    {
        var warehouse = await _context.Warehouses
            .Include(w => w.Address)
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == warehouseId);

        if (warehouse == null)
            return TypedResult<object>.Error("Warehouse not found", 404);

        // current number of orders assigned to this warehouse
        var curCapacity = await _context.WarehouseOrders
            .AsNoTracking()
            .CountAsync(wo => wo.WarehouseId == warehouse.Id);

        var dto = new
        {
            warehouse.Id,
            AddressId = warehouse.AddressId,
            warehouse.Capacity,
            CurOrderCapacity = curCapacity,
            Address = warehouse.Address == null
                ? null
                : new
                {
                    warehouse.Address.Id,
                    warehouse.Address.Street,
                    warehouse.Address.City,
                    warehouse.Address.State,
                    warehouse.Address.PostalCode,
                    warehouse.Address.CountryId
                }
        };

        return TypedResult<object>.Success(dto, "Warehouse retrieved successfully");
    }

    public async Task<PaginatedResult<object>> GetAllWarehousesAsync(int pageNumber, int pageSize)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize <= 0) pageSize = 15;

        var query = _context.Warehouses
            .Include(w => w.Address)
            .AsNoTracking();

        var totalItems = await query.CountAsync();

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(w => new
            {
                w.Id,
                AddressId = w.AddressId,
                w.Capacity,
                CurCapacity = _context.WarehouseOrders.Count(wo => wo.WarehouseId == w.Id),
                Address = w.Address == null
                    ? null
                    : new
                    {
                        w.Address.Id,
                        w.Address.Street,
                        w.Address.City,
                        w.Address.State,
                        w.Address.PostalCode,
                        w.Address.CountryId
                    }
            })
            .ToListAsync();

        return PaginatedResult<object>.Success(
            items,
            totalItems,
            pageNumber,
            pageSize,
            message: "Warehouses retrieved successfully"
        );
    }

    public async Task<TypedResult<object>> CreateWarehouseAsync(CreateWarehouseRequestDTO dto)
    {
        if (dto.Capacity < 0)
            return TypedResult<object>.Error("Capacity cannot be negative", 400);
        // Case 3: No address
        var wh = new Warehouse
        {
            AddressId = null,
            Capacity = dto.Capacity
        };


        var address = new Address
        {
            Street = dto.Address?.Street,
            City = dto.Address?.City,
            State = dto.Address?.State,
            PostalCode = dto.Address?.PostalCode,
            CountryId = dto.Address?.CountryId ?? 0,
            WarehouseId = wh.Id,
        };

        wh.AddressId = address.Id;

        _context.Addresses.Add(address);
        _context.Warehouses.Add(wh);
        await _context.SaveChangesAsync();
        return await GetWarehouseByIdAsync(wh.Id);
    }

    public async Task<TypedResult<object>> UpdateWarehouseAsync(string warehouseId, UpdateWarehouseRequestDTO dto)
    {
        var warehouse = await _context.Warehouses.Include(w => w.Address).FirstOrDefaultAsync(w => w.Id == warehouseId);
        if (warehouse == null)
            return TypedResult<object>.Error("Warehouse not found", 404);

        if (dto.Capacity.HasValue)
        {
            if (dto.Capacity.Value < 0)
                return TypedResult<object>.Error("Capacity cannot be negative", 400);
            warehouse.Capacity = dto.Capacity.Value;
        }

        // Inline address updates
        if (dto.Address != null)
        {
            // DB check: Country must exist
            var countryExists = await _context.CountryCodes.AnyAsync(c => c.Id == dto.Address.CountryId);
            if (!countryExists)
                return TypedResult<object>.Error("Country not found", 400);

            if (!string.IsNullOrWhiteSpace(warehouse.AddressId))
            {
                var addr = await _context.Addresses.FirstAsync(a => a.Id == warehouse.AddressId);
                addr.Street = dto.Address.Street;
                addr.City = dto.Address.City;
                addr.State = dto.Address.State;
                addr.PostalCode = dto.Address.PostalCode;
                addr.CountryId = dto.Address.CountryId;
                await _context.SaveChangesAsync();
            }
            else
            {
                var address = new Address
                {
                    Street = dto.Address.Street,
                    City = dto.Address.City,
                    State = dto.Address.State,
                    PostalCode = dto.Address.PostalCode,
                    CountryId = dto.Address.CountryId,
                    WarehouseId = warehouse.Id
                };
                _context.Addresses.Add(address);
                await _context.SaveChangesAsync();
                warehouse.AddressId = address.Id;
                await _context.SaveChangesAsync();
            }
        }

        await _context.SaveChangesAsync();
        return await GetWarehouseByIdAsync(warehouse.Id);
    }

    public async Task<Result> DeleteWarehouseAsync(string warehouseId)
    {
        var warehouse = await _context.Warehouses.FirstOrDefaultAsync(w => w.Id == warehouseId);
        if (warehouse == null)
            return Result.Error("Warehouse not found", 404);

        _context.Warehouses.Remove(warehouse);
        await _context.SaveChangesAsync();
        return Result.Success("Warehouse deleted successfully");
    }

    public async Task<PaginatedResult<object>> GetOrdersForWarehouseAsync(string warehouseId, int pageNumber = 1,
        int pageSize = 5)
    {
        if (string.IsNullOrWhiteSpace(warehouseId))
            return PaginatedResult<object>.Error("WarehouseId is required", 400);

        var warehouseExists = await _context.Warehouses.AsNoTracking().AnyAsync(w => w.Id == warehouseId);
        if (!warehouseExists)
            return PaginatedResult<object>.Error("Warehouse not found", 404);

        if (pageNumber < 1) pageNumber = 1;
        if (pageSize <= 0) pageSize = 5;

        var baseQuery = _context.WarehouseOrders
            .AsNoTracking()
            .Where(wo => wo.WarehouseId == warehouseId)
            .Include(wo => wo.Order)
            .ThenInclude(o => o.OrderItems);

        var totalItems = await baseQuery.CountAsync();

        var orders = await baseQuery
            .OrderByDescending(wo => wo.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(wo => new
            {
                wo.Order.Id,
                wo.Order.TotalAmount,
                wo.Order.CreatedAt,
                BuyerId = wo.Order.BuyerProfileId,
                SellerId = wo.Order.OrderItems
                    .Select(oi => oi.ProductVariant.Product.StoreInfo.SellerProfileId)
                    .FirstOrDefault(),
                ItemsCount = wo.Order.OrderItems.Count
            })
            .ToListAsync();

        return PaginatedResult<object>.Success(
            orders,
            totalItems,
            pageNumber,
            pageSize,
            message: "Warehouse orders retrieved successfully");
    }

    public async Task<TypedResult<object>> GetWarehouseOrderItemsAsync(string warehouseId, string orderId)
    {
        if (string.IsNullOrWhiteSpace(warehouseId) || string.IsNullOrWhiteSpace(orderId))
            return TypedResult<object>.Error("WarehouseId and OrderId are required", 400);

        var link = await _context.WarehouseOrders.AsNoTracking()
            .FirstOrDefaultAsync(wo => wo.WarehouseId == warehouseId && wo.OrderId == orderId);
        if (link == null)
            return TypedResult<object>.Error("Order does not belong to this warehouse or not found", 404);

        var items = await _context.OrderItems
            .AsNoTracking()
            .Where(oi => oi.OrderId == orderId)
            .Include(oi => oi.ProductVariant)
            .ThenInclude(pv => pv.Product)
            .ThenInclude(p => p.StoreInfo)
            .Include(oi => oi.ProductVariant)
            .ThenInclude(pv => pv.Images)
            .Select(oi => new
            {
                oi.Id,
                oi.Quantity,
                oi.OrderId,
                oi.ProductVariantId,
                oi.Status,
                VariantPrice = (oi.ProductVariant != null && oi.ProductVariant.Price > 0)
                    ? ((oi.ProductVariant.DiscountPrice > 0 &&
                        oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                        ? oi.ProductVariant.DiscountPrice
                        : oi.ProductVariant.Price)
                    : 0,
                ProductId = oi.ProductVariant.ProductId,
                Title = oi.ProductVariant.Title,
                ImageUrl = oi.ProductVariant.Images.Select(i => i.ImageUrl).FirstOrDefault(),
                BuyerId = oi.Order.BuyerProfileId,
                SellerId = oi.ProductVariant.Product.StoreInfo.SellerProfileId
            })
            .ToListAsync();

        return TypedResult<object>.Success(items, "Order items retrieved successfully");
    }

    public async Task<TypedResult<object>> AssignOrderItemsToWarehouseAsync(string warehouseId, string orderId)
    {
        if (string.IsNullOrWhiteSpace(warehouseId) || string.IsNullOrWhiteSpace(orderId))
            return TypedResult<object>.Error("warehouseId and orderId are required", 400);

        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == warehouseId);
        if (warehouse == null)
            return TypedResult<object>.Error("Warehouse not found", 404);

        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.ProductVariant)
            .ThenInclude(pv => pv.Images)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.ProductVariant)
            .ThenInclude(pv => pv.Product)
            .ThenInclude(p => p.StoreInfo)
            .FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null)
            return TypedResult<object>.Error("Order not found", 404);

        var existingLink = await _context.WarehouseOrders
            .FirstOrDefaultAsync(wo => wo.WarehouseId == warehouseId && wo.OrderId == orderId);
        if (existingLink != null)
        {
            // Already assigned; just return items
            var alreadyItems = order.OrderItems.Select(oi => new
            {
                oi.Id,
                oi.Quantity,
                oi.OrderId,
                oi.ProductVariantId,
                oi.Status,
                VariantPrice = (oi.ProductVariant != null && oi.ProductVariant.Price > 0)
                    ? ((oi.ProductVariant.DiscountPrice > 0 &&
                        oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                        ? oi.ProductVariant.DiscountPrice
                        : oi.ProductVariant.Price)
                    : 0,
                ProductId = oi.ProductVariant != null ? oi.ProductVariant.ProductId : null,
                Title = oi.ProductVariant != null ? oi.ProductVariant.Title : null,
                ImageUrl = (oi.ProductVariant != null && oi.ProductVariant.Images != null)
                    ? oi.ProductVariant.Images.Select(i => i.ImageUrl).FirstOrDefault()
                    : null,
                BuyerId = order.BuyerProfileId,
                SellerId = (oi.ProductVariant != null && oi.ProductVariant.Product != null &&
                            oi.ProductVariant.Product.StoreInfo != null)
                    ? oi.ProductVariant.Product.StoreInfo.SellerProfileId
                    : null
            }).ToList();
            return TypedResult<object>.Success(alreadyItems, "Order already assigned to this warehouse");
        }

        if (warehouse.Capacity <= 0)
            return TypedResult<object>.Error("Warehouse has reached its capacity", 400);

        var link = new Core.Models.WarehouseOrder
        {
            WarehouseId = warehouseId,
            OrderId = orderId,
            CreatedAt = DateTime.UtcNow,
        };

        _context.WarehouseOrders.Add(link);
        // decrement capacity per order assignment
        warehouse.Capacity -= 1;
        _context.Warehouses.Update(warehouse);

        // set back-reference on order for convenience
        order.WarehouseOrderId = link.Id;
        order.WarehouseOrder = link;
        order.UpdatedAt = DateTime.UtcNow;
        _context.Orders.Update(order);

        await _context.SaveChangesAsync();

        var items = order.OrderItems.Select(oi => new
        {
            oi.Id,
            oi.Quantity,
            oi.OrderId,
            oi.ProductVariantId,
            oi.Status,
            VariantPrice = (oi.ProductVariant != null && oi.ProductVariant.Price > 0)
                ? ((oi.ProductVariant.DiscountPrice > 0 && oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price)
                    ? oi.ProductVariant.DiscountPrice
                    : oi.ProductVariant.Price)
                : 0,
            ProductId = oi.ProductVariant != null ? oi.ProductVariant.ProductId : null,
            Title = oi.ProductVariant != null ? oi.ProductVariant.Title : null,
            ImageUrl = (oi.ProductVariant != null && oi.ProductVariant.Images != null)
                ? oi.ProductVariant.Images.Select(i => i.ImageUrl).FirstOrDefault()
                : null,
            BuyerId = order.BuyerProfileId,
            SellerId = (oi.ProductVariant != null && oi.ProductVariant.Product != null &&
                        oi.ProductVariant.Product.StoreInfo != null)
                ? oi.ProductVariant.Product.StoreInfo.SellerProfileId
                : null
        }).ToList();

        return TypedResult<object>.Success(new
        {
            WarehouseId = warehouseId,
            OrderId = orderId,
            AssignedAt = link.CreatedAt,
            Items = items
        }, "Order assigned to warehouse successfully");
    }
    
        public async Task<TypedResult<object>> AssignSpecificOrderItemsToWarehouseAsync(string warehouseId, string orderId, IList<string> orderItemIds)
    {
        if (string.IsNullOrWhiteSpace(warehouseId) || string.IsNullOrWhiteSpace(orderId))
            return TypedResult<object>.Error("warehouseId and orderId are required", 400);
        if (orderItemIds == null || orderItemIds.Count == 0)
            return TypedResult<object>.Error("orderItemIds list cannot be empty", 400);

        var distinctIds = orderItemIds.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().ToList();
        if (distinctIds.Count == 0)
            return TypedResult<object>.Error("No valid order item ids provided", 400);

        var warehouse = await _context.Warehouses.FirstOrDefaultAsync(w => w.Id == warehouseId);
        if (warehouse == null)
            return TypedResult<object>.Error("Warehouse not found", 404);

        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductVariant)
                    .ThenInclude(pv => pv.Product)
                        .ThenInclude(p => p.StoreInfo)
            .FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null)
            return TypedResult<object>.Error("Order not found", 404);

        var link = await _context.WarehouseOrders.FirstOrDefaultAsync(wo => wo.WarehouseId == warehouseId && wo.OrderId == orderId);
        bool newlyCreatedLink = false;
        if (link == null)
        {
            if (warehouse.Capacity <= 0)
                return TypedResult<object>.Error("Warehouse has reached its capacity", 400);
            link = new Core.Models.WarehouseOrder
            {
                WarehouseId = warehouseId,
                OrderId = orderId,
                CreatedAt = DateTime.UtcNow
            };
            _context.WarehouseOrders.Add(link);
            warehouse.Capacity -= 1; // consume capacity once per order
            _context.Warehouses.Update(warehouse);
            order.WarehouseOrderId = link.Id;
            order.WarehouseOrder = link;
            order.UpdatedAt = DateTime.UtcNow;
            _context.Orders.Update(order);
            newlyCreatedLink = true;
        }

        var existingAssigned = await _context.WarehouseOrderItems
            .Where(wi => wi.WarehouseOrderId == link.Id)
            .Select(wi => wi.OrderItemId)
            .ToListAsync();

        var orderItemIdsInOrder = order.OrderItems.Select(oi => oi.Id).ToHashSet();

        var invalidIds = distinctIds.Where(id => !orderItemIdsInOrder.Contains(id)).ToList();
        var alreadyAssignedIds = distinctIds.Where(id => existingAssigned.Contains(id)).ToList();
        var toAssign = distinctIds.Except(invalidIds).Except(alreadyAssignedIds).ToList();

        foreach (var itemId in toAssign)
        {
            _context.WarehouseOrderItems.Add(new Core.Models.WarehouseOrderItem
            {
                WarehouseOrderId = link.Id,
                OrderItemId = itemId,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        var assignedItemsDetails = order.OrderItems
            .Where(oi => toAssign.Contains(oi.Id) || alreadyAssignedIds.Contains(oi.Id))
            .Select(oi => new
            {
                oi.Id,
                oi.Quantity,
                oi.Status,
                oi.ProductVariantId,
                VariantPrice = oi.ProductVariant.Price,
                Title = oi.ProductVariant.Title,
                SellerId = oi.ProductVariant.Product.StoreInfo.SellerProfileId,
                Assigned = existingAssigned.Contains(oi.Id) || toAssign.Contains(oi.Id)
            }).ToList();

        return TypedResult<object>.Success(new
        {
            WarehouseId = warehouseId,
            OrderId = orderId,
            WarehouseOrderId = link.Id,
            NewlyCreatedLink = newlyCreatedLink,
            AddedItemIds = toAssign,
            AlreadyAssignedItemIds = alreadyAssignedIds,
            InvalidItemIds = invalidIds,
            Items = assignedItemsDetails
        }, "Specific order items assignment processed");
    }
}