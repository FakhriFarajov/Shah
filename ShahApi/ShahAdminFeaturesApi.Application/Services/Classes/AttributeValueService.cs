using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Core.Models;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class AttributeValueService : IAttributeValueService
{
    private readonly ShahDbContext _context;
    public AttributeValueService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<Result> AddAttributeValueAsync(string attributeId, AddProductAttributeValueRequestDto dto)
    {
        var attr = await _context.ProductAttributes.FirstOrDefaultAsync(a => a.Id == attributeId);
        if (attr == null)
            return Result.Error("Attribute not found");

        // Optional: enforce unique value per attribute
        var dup = await _context.ProductAttributeValues
            .AnyAsync(v => v.ProductAttributeId == attributeId && v.Value == dto.Value);
        if (dup)
            return Result.Error("This value already exists for the attribute");

        var val = new ProductAttributeValue
        {
            ProductAttributeId = attributeId,
            Value = dto.Value
        };
        _context.ProductAttributeValues.Add(val);
        await _context.SaveChangesAsync();
        return Result.Success("Attribute value added successfully");
    }

    public async Task<Result> EditAttributeValueAsync(string valueId, EditProductAttributeValueRequestDto dto)
    {
        var val = await _context.ProductAttributeValues
            .Include(v => v.ProductAttribute)
            .FirstOrDefaultAsync(v => v.Id == valueId);
        if (val == null)
            return Result.Error("Attribute value not found");

        if (!string.IsNullOrWhiteSpace(dto.Value))
        {
            // Optional: unique within same attribute
            var dup = await _context.ProductAttributeValues
                .AnyAsync(v => v.ProductAttributeId == val.ProductAttributeId && v.Value == dto.Value && v.Id != val.Id);
            if (dup)
                return Result.Error("This value already exists for the attribute");
            val.Value = dto.Value;
        }

        await _context.SaveChangesAsync();
        return Result.Success("Attribute value updated successfully");
    }

    public async Task<Result> DeleteAttributeValueAsync(string valueId)
    {
        var val = await _context.ProductAttributeValues.FirstOrDefaultAsync(v => v.Id == valueId);
        if (val == null)
            return Result.Error("Attribute value not found");

        // Prevent delete if used by any variant
        var used = await _context.ProductVariantAttributeValues.AnyAsync(l => l.ProductAttributeValueId == valueId);
        if (used)
            return Result.Error("Cannot delete value: it is used by a product variant");

        _context.ProductAttributeValues.Remove(val);
        await _context.SaveChangesAsync();
        return Result.Success("Attribute value deleted successfully");
    }
}

