using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Core.Models;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class VariantService : IVariantService
{
    private readonly ShahDbContext _context;

    public VariantService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<Result> EditVariantAsync(string variantId, EditProductVariantRequestDto dto)
    {
        var variant = await _context.ProductVariants
            .Include(v => v.ProductVariantAttributeValue)
            .ThenInclude(x => x.ProductAttributeValue)
            .FirstOrDefaultAsync(v => v.Id == variantId);

        if (variant == null)
            return Result.Error("Product variant not found");

        // Update scalar fields
        if (dto.Stock.HasValue)
        {
            if (dto.Stock.Value < 0)
                return Result.Error("Stock cannot be negative");
            variant.Stock = dto.Stock.Value;
        }

        if (dto.Price.HasValue)
        {
            if (dto.Price.Value < 0)
                return Result.Error("Price cannot be negative");
            variant.Price = dto.Price.Value;
        }

        // Replace attribute values if provided
        if (dto.AttributeValueIds != null)
        {
            // Validate provided value IDs exist
            var incomingIds = dto.AttributeValueIds.Distinct().ToList();
            var existingValueIds = await _context.ProductAttributeValues
                .Where(v => incomingIds.Contains(v.Id))
                .Select(v => v.Id)
                .ToListAsync();

            if (existingValueIds.Count != incomingIds.Count)
                return Result.Error("One or more attribute value IDs are invalid");

            // Current links
            var currentLinks = variant.ProductVariantAttributeValue.ToList();
            var currentIds = currentLinks.Select(l => l.ProductAttributeValueId).ToHashSet();

            // Remove links not in incoming
            var toRemove = currentLinks.Where(l => !incomingIds.Contains(l.ProductAttributeValueId)).ToList();
            if (toRemove.Count > 0)
            {
                _context.ProductVariantAttributeValues.RemoveRange(toRemove);
            }

            // Add missing links
            var toAddIds = incomingIds.Where(id => !currentIds.Contains(id)).ToList();
            foreach (var id in toAddIds)
            {
                _context.ProductVariantAttributeValues.Add(new ProductVariantAttributeValue
                {
                    ProductVariantId = variant.Id,
                    ProductAttributeValueId = id
                });
            }
        }

        await _context.SaveChangesAsync();
        return Result.Success("Product variant updated successfully");
    }
}
