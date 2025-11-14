using Microsoft.EntityFrameworkCore;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Request;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Core.Enums;
using ShahBuyerFeaturesApi.Core.Models;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;

namespace ShahBuyerFeaturesApi.Application.Services.Classes;

public class CheckoutService : ICheckoutService
{
    private readonly ShahDbContext _context;

    public CheckoutService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<TypedResult<object>> CheckoutAsync(string buyerProfileId, CheckoutRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(buyerProfileId))
            return TypedResult<object>.Error("BuyerProfileId is required", 400);

        var buyer = await _context.BuyerProfiles.FindAsync(buyerProfileId);
        if (buyer == null)
            return TypedResult<object>.Error("Buyer not found", 404);

        // Load cart with variants for this buyer
        var cartItems = await _context.CartItems
            .Include(ci => ci.ProductVariant)
            .Where(ci => ci.BuyerProfileId == buyerProfileId)
            .ToListAsync();

        if (cartItems.Count == 0)
            return TypedResult<object>.Error("Cart is empty", 400);

        // Validate stock and compute totals
        decimal subtotal = 0m;
        foreach (var ci in cartItems)
        {
            if (ci.ProductVariant == null)
                return TypedResult<object>.Error("Cart contains invalid product variant", 400);

            if (ci.ProductVariant.Stock < ci.Quantity)
                return TypedResult<object>.Error($"Not enough stock for variant {ci.ProductVariant.Title}", 400);

            subtotal += ci.ProductVariant.Price * ci.Quantity;
        }

        var currency = string.IsNullOrWhiteSpace(request.Currency) ? "USD" : request.Currency!;

        // Perform changes in a transaction
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            // Create order and receipt with linked IDs prior to save
            var order = new Order
            {
                BuyerProfileId = buyerProfileId,
                Status = OrderStatus.Pending,
                TotalAmount = subtotal
            };

            var receipt = new Receipt
            {
                Amount = subtotal,
                FileUrl = string.Empty, // Placeholder until receipt generation is implemented
                OrderId = order.Id
            };

            // Determine payment details
            var method = request.Method ?? PaymentMethod.CreditCard;
            var gatewayTxnId = string.IsNullOrWhiteSpace(request.GatewayTransactionId)
                ? Guid.NewGuid().ToString() // generate placeholder if none supplied
                : request.GatewayTransactionId.Trim();
            var paymentStatus = string.IsNullOrWhiteSpace(request.GatewayTransactionId) ? PaymentStatus.Pending : PaymentStatus.Paid;

            var orderPayment = new OrderPayment
            {
                BuyerProfileId = buyerProfileId,
                TotalAmount = subtotal,
                Currency = currency,
                Method = method,
                Status = paymentStatus,
                GatewayTransactionId = gatewayTxnId,
                OrderId = order.Id
            };

            // Link both navigation properties explicitly
            order.ReceiptId = receipt.Id;
            order.Receipt = receipt;
            receipt.Order = order;
            order.OrderPaymentId = orderPayment.Id;
            order.OrderPayment = orderPayment;
            orderPayment.Order = order; // ensure navigation populated

            // Create order items
            var orderItems = new List<OrderItem>(capacity: cartItems.Count);
            foreach (var ci in cartItems)
            {
                orderItems.Add(new OrderItem
                {
                    OrderId = order.Id,
                    ProductVariantId = ci.ProductVariantId,
                    Quantity = ci.Quantity
                });

                // Deduct stock
                ci.ProductVariant!.Stock -= ci.Quantity;
            }
            order.OrderItems = orderItems;

            // Persist order + receipt + payment + items, update variants, and clear cart
            await _context.Orders.AddAsync(order);
            await _context.Receipts.AddAsync(receipt);
            await _context.OrderPayments.AddAsync(orderPayment);
            _context.OrderItems.AddRange(orderItems);
            _context.ProductVariants.UpdateRange(cartItems.Select(ci => ci.ProductVariant!));
            _context.CartItems.RemoveRange(cartItems);

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            var summary = new
            {
                OrderId = order.Id,
                ReceiptId = receipt.Id,
                OrderPaymentId = orderPayment.Id,
                Status = order.Status.ToString(),
                Currency = currency,
                Total = subtotal,
                Payment = new
                {
                    orderPayment.Method,
                    orderPayment.Status,
                    orderPayment.GatewayTransactionId
                },
                Items = orderItems.Select(oi => new
                {
                    oi.ProductVariantId,
                    oi.Quantity
                }).ToList(),
                Note = request.Note
            };

            return TypedResult<object>.Success(summary, "Checkout completed", 200);
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return TypedResult<object>.Error($"Checkout failed: {ex.Message}", 500);
        }
    }
}
