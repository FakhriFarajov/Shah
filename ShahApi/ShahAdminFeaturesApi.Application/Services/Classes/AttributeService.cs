using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Core.Models;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class AttributeService : IAttributeService
{
    private readonly ShahDbContext _context;
    public AttributeService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<Result> AddAttributeAsync(AddProductAttributeRequestDto dto)
    {
        // Validate category exists
        var catExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!catExists)
            return Result.Error("Category not found");

        // Optional: enforce unique attribute name per category
        var exists = await _context.ProductAttributes.AnyAsync(a => a.CategoryId == dto.CategoryId && a.Name == dto.Name);
        if (exists)
            return Result.Error("An attribute with the same name already exists in this category");

        var attr = new ProductAttribute
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name
        };
        _context.ProductAttributes.Add(attr);
        await _context.SaveChangesAsync();
        return Result.Success("Attribute added successfully");
    }
    
    public async Task<Result> EditAttributeAsync(string attributeId, EditProductAttributeRequestDto dto)
    {
        var attr = await _context.ProductAttributes.FirstOrDefaultAsync(a => a.Id == attributeId);
        if (attr == null)
            return Result.Error("Attribute not found");

        if (!string.IsNullOrWhiteSpace(dto.Name))
        {
            // Optional: enforce unique name within the same category
            var dup = await _context.ProductAttributes.AnyAsync(a => a.CategoryId == attr.CategoryId && a.Name == dto.Name && a.Id != attr.Id);
            if (dup)
                return Result.Error("An attribute with the same name already exists in this category");
            attr.Name = dto.Name;
        }

        await _context.SaveChangesAsync();
        return Result.Success("Attribute updated successfully");
    }

    public async Task<Result> DeleteAttributeAsync(string attributeId)
    {
        var attr = await _context.ProductAttributes
            .Include(a => a.AttributeValues)
            .FirstOrDefaultAsync(a => a.Id == attributeId);
        if (attr == null)
            return Result.Error("Attribute not found");

        // Optional: prevent delete if any of its values are used by variants
        var used = await _context.ProductVariantAttributeValues
            .AnyAsync(l => l.ProductAttributeValue.ProductAttributeId == attributeId);
        if (used)
            return Result.Error("Cannot delete attribute because some values are used by product variants");

        // Delete values first, then attribute
        if (attr.AttributeValues.Count > 0)
        {
            _context.ProductAttributeValues.RemoveRange(attr.AttributeValues);
        }
        _context.ProductAttributes.Remove(attr);
        await _context.SaveChangesAsync();
        return Result.Success("Attribute deleted successfully");
    }
}
