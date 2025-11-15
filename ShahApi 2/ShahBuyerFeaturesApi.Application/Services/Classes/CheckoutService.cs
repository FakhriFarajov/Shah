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
    private readonly IPdfReceiptService _pdfReceiptService;

    public CheckoutService(ShahDbContext context, IPdfReceiptService pdfReceiptService)
    {
        _context = context;
        _pdfReceiptService = pdfReceiptService;
    }

    public async Task<TypedResult<object>> CheckoutAsync(string buyerProfileId, CheckoutRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(buyerProfileId))
            return TypedResult<object>.Error("BuyerProfileId is required");

        var buyer = await _context.BuyerProfiles.FindAsync(buyerProfileId);
        if (buyer == null)
            return TypedResult<object>.Error("Buyer not found", 404);

        // Load cart with variants for this buyer
        var cartItems = await _context.CartItems
            .Include(ci => ci.ProductVariant)
            .Where(ci => ci.BuyerProfileId == buyerProfileId)
            .ToListAsync();

        if (cartItems.Count == 0)
            return TypedResult<object>.Error("Cart is empty");

        // Validate stock and compute totals
        decimal subtotal = 0m;
        foreach (var ci in cartItems)
        {
            if (ci.ProductVariant == null)
                return TypedResult<object>.Error("Cart contains invalid product variant");

            if (ci.ProductVariant.Stock < ci.Quantity)
                return TypedResult<object>.Error($"Not enough stock for variant {ci.ProductVariant.Title}");

            subtotal += ci.ProductVariant.Price * ci.Quantity;
        }

        var currency = string.IsNullOrWhiteSpace(request.Currency) ? "USD" : request.Currency!;

        // Perform changes in a transaction
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            // Create order (do NOT create receipt placeholder here)
            var order = new Order
            {
                BuyerProfileId = buyerProfileId,
                TotalAmount = subtotal
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

            // Link payment navigation
            order.OrderPaymentId = orderPayment.Id;
            order.OrderPayment = orderPayment;
            orderPayment.Order = order;

            // Create order items and deduct stock
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

            // Persist order + payment + items, update variants, and clear cart
            await _context.Orders.AddAsync(order);
            await _context.OrderPayments.AddAsync(orderPayment);
            _context.OrderItems.AddRange(orderItems);
            _context.ProductVariants.UpdateRange(cartItems.Select(ci => ci.ProductVariant!));
            _context.CartItems.RemoveRange(cartItems);

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            // Generate and email receipt AFTER committing the order
            var receiptResult = await _pdfReceiptService.GenerateAndSaveReceiptAsync(order.Id, buyerProfileId);
            string? receiptId = null;
            string? receiptFileName = null;
            if (receiptResult.IsSuccess && receiptResult.Data != null)
            {
                // Data is an anonymous type returned by PdfReceiptService; use dynamic to read fields
                dynamic data = receiptResult.Data;
                try
                {
                    receiptId = data.orderReceiptId;
                }
                catch { /* ignore if not present */ }
                try
                {
                    receiptFileName = data.fileUrl;
                }
                catch { /* ignore if not present */ }
            }

            if (!string.IsNullOrWhiteSpace(receiptId))
            {
                order.ReceiptId = receiptId;
                _context.Orders.Update(order);
                await _context.SaveChangesAsync();
            }

            var summary = new
            {
                OrderId = order.Id,
                OrderPaymentId = orderPayment.Id,
                Currency = currency,
                Total = subtotal,
                Payment = new
                {
                    orderPayment.Method,
                    orderPayment.Status,
                    orderPayment.GatewayTransactionId
                },
                Receipt = new
                {
                    Id = order.ReceiptId,
                    FileUrl = receiptFileName // MinIO object name (filename)
                },
                Items = orderItems.Select(oi => new
                {
                    oi.ProductVariantId,
                    oi.Status,
                    oi.Quantity
                }).ToList(),
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
