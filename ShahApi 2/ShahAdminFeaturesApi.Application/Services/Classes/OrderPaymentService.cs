using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Core.Models;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class OrderPaymentService : IOrderPaymentService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;

    public OrderPaymentService(ShahDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result> UpsertOrderPaymentAsync(UpsertOrderPaymentRequestDTO request)
    {
        if (string.IsNullOrWhiteSpace(request.BuyerProfileId))
            return Result.Error("BuyerProfileId is required", 400);

        var buyerProfile = await _context.BuyerProfiles.FindAsync(request.BuyerProfileId);
        if (buyerProfile == null)
            return Result.Error("BuyerProfile not found", 404);

        OrderPayment orderPayment = null;
        if (!string.IsNullOrWhiteSpace(request.Id))
        {
            orderPayment = await _context.OrderPayments.FindAsync(request.Id);
        }
        if (orderPayment != null)
        {
            _mapper.Map(request, orderPayment);
            orderPayment.BuyerProfileId = request.BuyerProfileId;
            await _context.SaveChangesAsync();
            return Result.Success("Order payment updated successfully");
        }

        var newOrderPayment = _mapper.Map<OrderPayment>(request);
        newOrderPayment.BuyerProfileId = request.BuyerProfileId;
        await _context.OrderPayments.AddAsync(newOrderPayment);
        await _context.SaveChangesAsync();
        return Result.Success("Order payment added successfully");
    }

    public async Task<Result> DeleteOrderPaymentAsync(string orderPaymentId)
    {
        var orderPayment = await _context.OrderPayments.FindAsync(orderPaymentId);
        if (orderPayment == null)
            return Result.Error("Order payment not found", 404);

        _context.OrderPayments.Remove(orderPayment);
        await _context.SaveChangesAsync();
        return Result.Success("Order payment deleted successfully");
    }

    public async Task<TypedResult<object>> GetOrderPaymentByIdAsync(string orderPaymentId)
    {
        var orderPayment = await _context.OrderPayments.FindAsync(orderPaymentId);
        if (orderPayment == null)
        {
            throw new Exception("Order payment not found");
        }

        return TypedResult<object>.Success(new
        {
            orderPayment.Id,
            orderPayment.TotalAmount,
            orderPayment.Currency,
            orderPayment.Method,
            orderPayment.Status,
            orderPayment.GatewayTransactionId,
            orderPayment.RefundAmount,
            orderPayment.RefundReason,
            orderPayment.BuyerProfileId
        });
    }

    public async Task<TypedResult<object>> GetBuyerOrderPaymentsAsync(string buyerProfileId)
    {
        var orderPayments = await _context.OrderPayments
            .Where(op => op.BuyerProfileId == buyerProfileId)
            .ToListAsync();
        if (orderPayments == null || !orderPayments.Any())
        {
            throw new Exception("Order payments not found");
        }

        var result = orderPayments.Select(orderPayment => new
        {
            orderPayment.Id,
            orderPayment.TotalAmount,
            orderPayment.Currency,
            orderPayment.Method,
            orderPayment.Status,
            orderPayment.GatewayTransactionId,
            orderPayment.RefundAmount,
            orderPayment.RefundReason,
        });
        return TypedResult<object>.Success(result);
    }
}

