using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Core.Models;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class CategoryService
{
    private readonly ShahDbContext _context;
    
    public CategoryService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<TypedResult<object>> GetAllCategoriesAsync()
    {
        var categories = await _context.Categories.AsNoTracking()
            .Select(c => new { c.Id, c.CategoryName, c.ParentCategoryId })
            .ToListAsync();
        
        return TypedResult<object>.Success(categories, "Categories retrieved successfully");
    }

    public async Task<TypedResult<object>> GetCategoryTreeAsync()
    {
        var cats = await _context.Categories.AsNoTracking()
            .Select(c => new { c.Id, c.CategoryName, c.ParentCategoryId })
            .ToListAsync();

        var nodes = cats.ToDictionary(
            c => c.Id,
            c => new CategoryNodeDto
            {
                Id = c.Id,
                CategoryName = c.CategoryName,
                ParentCategoryId = c.ParentCategoryId,
                Children = new List<CategoryNodeDto>()
            });

        var roots = new List<CategoryNodeDto>();
        foreach (var c in cats)
        {
            if (string.IsNullOrWhiteSpace(c.ParentCategoryId) || !nodes.ContainsKey(c.ParentCategoryId))
            {
                roots.Add(nodes[c.Id]);
            }
            else
            {
                nodes[c.ParentCategoryId].Children.Add(nodes[c.Id]);
            }
        }

        return TypedResult<object>.Success(roots, "Category tree retrieved successfully");
    }
    
    public async Task<Result> AddCategoryAsync(string categoryName, string? parentCategoryId, AttributesAndValuesRequestDto attributesAndValues)
    {
        if (!string.IsNullOrWhiteSpace(parentCategoryId))
        {
            var parentExists = await _context.Categories.AnyAsync(c => c.Id == parentCategoryId);
            if (!parentExists)
                return Result.Error("Parent category not found");
        }
        
        // Validate category name
        if (string.IsNullOrWhiteSpace(categoryName))
            return Result.Error("Category name is required");
        
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var category = new Category
            {
                CategoryName = categoryName.Trim(),
                ParentCategoryId = parentCategoryId
            };
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Create attributes with server-generated GUID ids
            var createdAttributes = new List<ProductAttribute>();
            if (attributesAndValues != null && attributesAndValues.Attributes.Count > 0)
            {
                // Enforce unique attribute names within the request (case-insensitive)
                var attrNames = attributesAndValues.Attributes
                    .Where(a => !string.IsNullOrWhiteSpace(a.Name))
                    .Select(a => a.Name.Trim())
                    .ToList();
                var dupNames = attrNames
                    .GroupBy(n => n, StringComparer.OrdinalIgnoreCase)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .ToList();
                if (dupNames.Count > 0)
                    return Result.Error($"Duplicate attribute names in request: {string.Join(", ", dupNames)}");

                var attrEntities = new List<ProductAttribute>();
                foreach (var a in attributesAndValues.Attributes)
                {
                    if (string.IsNullOrWhiteSpace(a.Name)) continue;
                    var name = a.Name.Trim();
                    attrEntities.Add(new ProductAttribute
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = name,
                        CategoryId = category.Id
                    });
                }

                if (attrEntities.Count > 0)
                {
                    _context.ProductAttributes.AddRange(attrEntities);
                    await _context.SaveChangesAsync();
                    createdAttributes = attrEntities;
                }
            }

            // Map attribute values
            if (attributesAndValues != null && attributesAndValues.AttributeValues.Count > 0)
            {
                var valueEntities = new List<ProductAttributeValue>();
                var singleAttrId = createdAttributes.Count == 1 ? createdAttributes[0].Id : null;
                var nameToId = createdAttributes
                    .GroupBy(x => x.Name.Trim(), StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(g => g.Key, g => g.First().Id, StringComparer.OrdinalIgnoreCase);

                foreach (var v in attributesAndValues.AttributeValues)
                {
                    if (string.IsNullOrWhiteSpace(v.Value)) continue;

                    string? targetAttrId = null;
                    // If client somehow knows GUID, allow direct Id
                    if (!string.IsNullOrWhiteSpace(v.ProductAttributeId) && createdAttributes.Any(a => a.Id == v.ProductAttributeId))
                    {
                        targetAttrId = v.ProductAttributeId;
                    }
                    else if (!string.IsNullOrWhiteSpace(v.ProductAttributeName))
                    {
                        var key = v.ProductAttributeName.Trim();
                        if (nameToId.TryGetValue(key, out var mappedId))
                            targetAttrId = mappedId;
                    }
                    else if (singleAttrId != null)
                    {
                        targetAttrId = singleAttrId;
                    }

                    if (targetAttrId == null)
                        return Result.Error("Unable to map attribute value to an attribute. Provide productAttributeName or create only one attribute in the request.");

                    valueEntities.Add(new ProductAttributeValue
                    {
                        ProductAttributeId = targetAttrId,
                        Value = v.Value.Trim()
                    });
                }

                if (valueEntities.Count > 0)
                {
                    _context.ProductAttributeValues.AddRange(valueEntities);
                    await _context.SaveChangesAsync();
                }
            }

            await tx.CommitAsync();
            return Result.Success("Category added successfully");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
    
    public async Task<Result> DeleteCategoryAsync(string id)
    {
        // Block delete if there are subcategories
        var hasChildren = await _context.Categories.AnyAsync(c => c.ParentCategoryId == id);
        if (hasChildren)
            return Result.Error("Cannot delete a category that has subcategories");

        var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) return Result.Error("Category not found");

        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            // Collect all attribute value ids under this category
            var valueIdsQuery = _context.ProductAttributeValues
                .Where(v => v.ProductAttribute.CategoryId == id)
                .Select(v => v.Id);

            // If any of these values are used by product variants, block deletion
            var anyUsed = await _context.ProductVariantAttributeValues
                .AnyAsync(link => valueIdsQuery.Contains(link.ProductAttributeValueId));
            if (anyUsed)
                return Result.Error("Cannot delete category: some attribute values are used by product variants");

            // Delete attribute values first
            await _context.ProductAttributeValues
                .Where(v => v.ProductAttribute.CategoryId == id)
                .ExecuteDeleteAsync();

            // Then delete attributes
            await _context.ProductAttributes
                .Where(a => a.CategoryId == id)
                .ExecuteDeleteAsync();

            // Finally delete the category
            _context.Categories.Remove(cat);
            await _context.SaveChangesAsync();

            await tx.CommitAsync();
            return Result.Success("Category deleted successfully");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
    
    public async Task<TypedResult<object>> GetProductVariantsAsync(string categoryId, bool includeDescendants = false)
    {
        // collect category ids to search (self + descendants optionally)
        var categoryIds = new HashSet<string> { categoryId };
        if (includeDescendants)
        {
            var all = await _context.Categories
                .AsNoTracking()
                .Select(c => new { c.Id, c.ParentCategoryId })
                .ToListAsync();
            foreach (var id in GetDescendantIds(categoryId, all))
                categoryIds.Add(id);
        }

        // query variants for products in these categories
        var variants = await _context.Products
            .AsNoTracking()
            .Where(p => categoryIds.Contains(p.CategoryId))
            .SelectMany(p => p.ProductVariants)
            .Select(v => new ProductVariantDto
            {
                Id = v.Id,
                ProductId = v.ProductId,
                Stock = v.Stock,
                Price = v.Price,
                Attributes = v.ProductVariantAttributeValues
                    .Select(pvav => new ProductVariantAttributeDto
                    {
                        AttributeName = pvav.ProductAttributeValue.ProductAttribute.Name,
                        AttributeValueId = pvav.ProductAttributeValueId,
                        AttributeValue = pvav.ProductAttributeValue.Value
                    }).ToList()
            })
            .ToListAsync();

        return TypedResult<object>.Success(variants, "Product variants retrieved successfully");
    }

    private static IEnumerable<string> GetDescendantIds(string rootId, IEnumerable<dynamic> flat)
    {
        // Build lookup keyed by non-null ParentCategoryId
        var lookup = flat
            .Where(x => !string.IsNullOrWhiteSpace((string?)x.ParentCategoryId))
            .GroupBy(x => (string)x.ParentCategoryId)
            .ToDictionary(g => g.Key, g => g.Select(i => (string)i.Id).ToList());

        var stack = new Stack<string>();
        stack.Push(rootId);
        while (stack.Count > 0)
        {
            var current = stack.Pop();
            if (!lookup.TryGetValue(current, out var children))
                continue;
            foreach (var child in children)
            {
                yield return child;
                stack.Push(child);
            }
        }
    }
    
    public async Task<TypedResult<object>> GetAttributesWithValuesAsync(string categoryId)
    {
        var exists = await _context.Categories.AsNoTracking().AnyAsync(c => c.Id == categoryId);
        if (!exists)
            return TypedResult<object>.Error("Category not found", 404);

        var data = await _context.ProductAttributes
            .AsNoTracking()
            .Where(a => a.CategoryId == categoryId)
            .Select(a => new
            {
                a.Id,
                a.Name,
                a.CategoryId,
                Values = a.AttributeValues
                    .Select(v => new { v.Id, v.Value })
                    .ToList()
            })
            .ToListAsync();

        return TypedResult<object>.Success(data, "Attributes with values retrieved successfully");
    }

    public async Task<TypedResult<object>> GetAllCategoriesWithAttributesAndValuesAsync()
    {
        var data = await _context.Categories
            .AsNoTracking()
            .Select(c => new
            {
                c.Id,
                c.CategoryName,
                c.ParentCategoryId,
                Attributes = c.ProductAttributes
                    .Select(a => new
                    {
                        a.Id,
                        a.Name,
                        Values = a.AttributeValues
                            .Select(v => new { v.Id, v.Value })
                            .ToList()
                    }).ToList()
            })
            .ToListAsync();

        return TypedResult<object>.Success(data, "Categories with attributes and values retrieved successfully");
    }

    public async Task<Result> SyncCategoriesWithAttributesAsync(List<SyncCategoryItemDto> items, bool fullReplace = false)
    {
        if (items == null || items.Count == 0)
            return Result.Error("Payload is empty");

        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            // Track all categories from DB
            var catEntities = await _context.Categories.ToDictionaryAsync(c => c.Id, c => c);

            // 1) Upsert categories (without parents first) and compute resolved ids per item
            var resolvedIds = new List<string>(capacity: items.Count);
            for (int i = 0; i < items.Count; i++)
            {
                var item = items[i];
                var name = (item.CategoryName ?? string.Empty).Trim();
                if (string.IsNullOrWhiteSpace(name))
                    return Result.Error("CategoryName is required for all items");

                if (!string.IsNullOrWhiteSpace(item.Id) && catEntities.TryGetValue(item.Id!, out var existing))
                {
                    existing.CategoryName = name;
                    resolvedIds.Add(existing.Id);
                }
                else
                {
                    var newId = string.IsNullOrWhiteSpace(item.Id) ? Guid.NewGuid().ToString() : item.Id!.Trim();
                    var entity = new Category
                    {
                        Id = newId,
                        CategoryName = name,
                        ParentCategoryId = null // set later
                    };
                    _context.Categories.Add(entity);
                    catEntities[newId] = entity;
                    resolvedIds.Add(newId);
                }
            }
            await _context.SaveChangesAsync();

            // 2) Apply parent relations with cycle prevention using in-memory parents
            for (int i = 0; i < items.Count; i++)
            {
                var item = items[i];
                var catId = resolvedIds[i];
                var entity = catEntities[catId];

                if (item.ParentCategoryId == null)
                {
                    entity.ParentCategoryId = null;
                    continue;
                }

                var parentId = item.ParentCategoryId.Trim();
                if (!catEntities.ContainsKey(parentId))
                {
                    if (!fullReplace)
                    {
                        // Partial mode: skip changing parent if parent not found yet
                        continue;
                    }
                    return Result.Error($"Parent category '{parentId}' not found for category '{catId}'");
                }

                // prevent cycles by walking up parents in-memory
                var walker = parentId;
                while (!string.IsNullOrWhiteSpace(walker))
                {
                    if (walker == catId)
                        return Result.Error("Invalid parent: would create a cycle");
                    if (!catEntities.TryGetValue(walker, out var p)) break;
                    walker = p.ParentCategoryId;
                }

                entity.ParentCategoryId = parentId;
            }
            await _context.SaveChangesAsync();

            // 3) Sync attributes and values for each category
            for (int i = 0; i < items.Count; i++)
            {
                var item = items[i];
                var catId = resolvedIds[i];

                // Load existing attributes with values
                var attrs = await _context.ProductAttributes
                    .Where(a => a.CategoryId == catId)
                    .Include(a => a.AttributeValues)
                    .ToListAsync();
                var attrById = attrs.ToDictionary(a => a.Id);
                
                // Validate duplicate attribute names within payload
                var payloadAttrNames = item.Attributes
                    .Where(a => !string.IsNullOrWhiteSpace(a.Name))
                    .Select(a => a.Name.Trim())
                    .ToList();
                var dupAttrNames = payloadAttrNames
                    .GroupBy(n => n, StringComparer.OrdinalIgnoreCase)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .ToList();
                if (dupAttrNames.Count > 0)
                    return Result.Error($"Duplicate attribute names in payload for category '{item.CategoryName}': {string.Join(", ", dupAttrNames)}");

                // Upsert attributes
                var payloadAttrIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                foreach (var a in item.Attributes)
                {
                    var aName = (a.Name ?? string.Empty).Trim();
                    if (string.IsNullOrWhiteSpace(aName))
                        return Result.Error($"Attribute name is required (category '{item.CategoryName}')");

                    ProductAttribute? existingAttr = null;

                    // If Id is provided, verify globally to avoid PK duplicates or cross-category moves
                    if (!string.IsNullOrWhiteSpace(a.Id))
                    {
                        var idTrim = a.Id!.Trim();
                        if (attrById.TryGetValue(idTrim, out var byLocal))
                        {
                            existingAttr = byLocal;
                        }
                        else
                        {
                            var globalAttr = await _context.ProductAttributes.FirstOrDefaultAsync(x => x.Id == idTrim);
                            if (globalAttr != null)
                            {
                                if (!string.Equals(globalAttr.CategoryId, catId, StringComparison.Ordinal))
                                    return Result.Error($"Attribute Id '{idTrim}' belongs to a different category");
                                // ensure it's tracked in the local collections
                                existingAttr = attrs.FirstOrDefault(x => x.Id == idTrim) ?? globalAttr;
                                if (!attrById.ContainsKey(idTrim)) attrById[idTrim] = existingAttr;
                                if (!attrs.Any(x => x.Id == idTrim)) attrs.Add(existingAttr);
                            }
                        }
                    }

                    // If still not resolved and name matches an existing attribute in this category, reuse it
                    if (existingAttr == null)
                    {
                        existingAttr = attrs.FirstOrDefault(x => string.Equals(x.Name.Trim(), aName, StringComparison.OrdinalIgnoreCase));
                    }

                    if (existingAttr != null)
                    {
                        // rename with uniqueness check if necessary
                        if (!string.Equals(existingAttr.Name?.Trim(), aName, StringComparison.OrdinalIgnoreCase))
                        {
                            var collision = attrs.Any(x => x.Id != existingAttr.Id && string.Equals(x.Name.Trim(), aName, StringComparison.OrdinalIgnoreCase));
                            if (collision)
                                return Result.Error($"An attribute with the name '{aName}' already exists in category '{item.CategoryName}'");
                            existingAttr.Name = aName;
                        }
                        payloadAttrIds.Add(existingAttr.Id);
                    }
                    else
                    {
                        // Create new attribute with server-generated Id (ignore client-provided Id for creation)
                        var newAttrId = Guid.NewGuid().ToString();

                        // uniqueness check for new attribute name
                        var collision = attrs.Any(x => string.Equals(x.Name.Trim(), aName, StringComparison.OrdinalIgnoreCase));
                        if (collision)
                            return Result.Error($"An attribute with the name '{aName}' already exists in category '{item.CategoryName}'");

                        var newAttr = new ProductAttribute
                        {
                            Id = newAttrId,
                            Name = aName,
                            CategoryId = catId
                        };
                        _context.ProductAttributes.Add(newAttr);
                        await _context.SaveChangesAsync();
                        attrs.Add(newAttr);
                        attrById[newAttrId] = newAttr;
                        payloadAttrIds.Add(newAttrId);
                    }
                }

                // Delete attributes not present in payload (with safety checks) - authoritative per included category
                var toDeleteAttrIds = attrs.Select(x => x.Id).Where(id => !payloadAttrIds.Contains(id)).ToList();
                if (toDeleteAttrIds.Count > 0)
                {
                    var delValueIds = await _context.ProductAttributeValues
                        .Where(v => toDeleteAttrIds.Contains(v.ProductAttributeId))
                        .Select(v => v.Id)
                        .ToListAsync();

                    if (delValueIds.Count > 0)
                    {
                        var used = await _context.ProductVariantAttributeValues
                            .AnyAsync(l => delValueIds.Contains(l.ProductAttributeValueId));
                        if (used)
                            return Result.Error($"Cannot delete some attributes in category '{item.CategoryName}': some values are used by product variants");

                        _context.ProductAttributeValues.RemoveRange(
                            _context.ProductAttributeValues.Where(v => delValueIds.Contains(v.Id)));
                    }

                    _context.ProductAttributes.RemoveRange(
                        _context.ProductAttributes.Where(a => toDeleteAttrIds.Contains(a.Id)));
                    await _context.SaveChangesAsync();

                    // refresh collections
                    attrs = await _context.ProductAttributes
                        .Where(a => a.CategoryId == catId)
                        .Include(a => a.AttributeValues)
                        .ToListAsync();
                    attrById = attrs.ToDictionary(a => a.Id);
                }

                // Values sync per attribute
                foreach (var a in item.Attributes)
                {
                    // Resolve target attribute id (by id->name)
                    ProductAttribute targetAttr;
                    if (!string.IsNullOrWhiteSpace(a.Id) && attrById.TryGetValue(a.Id!, out var foundById))
                        targetAttr = foundById;
                    else
                        targetAttr = attrs.First(x => string.Equals(x.Name.Trim(), a.Name!.Trim(), StringComparison.OrdinalIgnoreCase));

                    var existingVals = targetAttr.AttributeValues.ToList();
                    var valById = existingVals.ToDictionary(v => v.Id);

                    // check duplicates in payload values (by value string)
                    var payloadVals = a.Values.Select(v => (v.Id, value: (v.Value ?? string.Empty).Trim())).ToList();
                    var dupVals = payloadVals
                        .GroupBy(x => x.value, StringComparer.OrdinalIgnoreCase)
                        .Where(g => g.Count() > 1)
                        .Select(g => g.Key)
                        .ToList();
                    if (dupVals.Count > 0)
                        return Result.Error($"Duplicate values for attribute '{a.Name}' in category '{item.CategoryName}': {string.Join(", ", dupVals)}");

                    // upsert values (resolve by id then by value)
                    var payloadValIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    foreach (var v in a.Values)
                    {
                        var newValue = (v.Value ?? string.Empty).Trim();
                        if (string.IsNullOrWhiteSpace(newValue))
                            return Result.Error($"Value is required for attribute '{a.Name}' in category '{item.CategoryName}'");

                        ProductAttributeValue? existingVal = null;
                        if (!string.IsNullOrWhiteSpace(v.Id))
                        {
                            // local lookup
                            if (!valById.TryGetValue(v.Id!, out existingVal))
                            {
                                // global lookup to ensure the provided Id isn't used under another attribute
                                var globalVal = await _context.ProductAttributeValues.FirstOrDefaultAsync(x => x.Id == v.Id);
                                if (globalVal != null)
                                {
                                    if (!string.Equals(globalVal.ProductAttributeId, targetAttr.Id, StringComparison.Ordinal))
                                        return Result.Error($"Value Id '{v.Id}' belongs to a different attribute");
                                    // bring it into local set if missing
                                    existingVal = globalVal;
                                    valById[globalVal.Id] = globalVal;
                                    if (!existingVals.Any(x => x.Id == globalVal.Id)) existingVals.Add(globalVal);
                                }
                            }
                        }
                        if (existingVal == null)
                            existingVal = existingVals.FirstOrDefault(x => string.Equals(x.Value.Trim(), newValue, StringComparison.OrdinalIgnoreCase));

                        if (existingVal != null)
                        {
                            if (!string.Equals(existingVal.Value, newValue, StringComparison.OrdinalIgnoreCase))
                            {
                                var dup = existingVals.Any(x => x.Id != existingVal.Id && string.Equals(x.Value.Trim(), newValue, StringComparison.OrdinalIgnoreCase));
                                if (dup)
                                    return Result.Error($"This value already exists for attribute '{a.Name}' in category '{item.CategoryName}'");
                                existingVal.Value = newValue;
                            }
                            payloadValIds.Add(existingVal.Id);
                        }
                        else
                        {
                            // Always generate new Id for creation (ignore client-provided Id to avoid PK collisions)
                            string newValId = Guid.NewGuid().ToString();

                            var dup = existingVals.Any(x => string.Equals(x.Value.Trim(), newValue, StringComparison.OrdinalIgnoreCase));
                            if (dup)
                                return Result.Error($"This value already exists for attribute '{a.Name}' in category '{item.CategoryName}'");

                            var newVal = new ProductAttributeValue
                            {
                                Id = newValId,
                                ProductAttributeId = targetAttr.Id,
                                Value = newValue
                            };
                            _context.ProductAttributeValues.Add(newVal);
                            await _context.SaveChangesAsync();
                            existingVals.Add(newVal);
                            valById[newValId] = newVal;
                            payloadValIds.Add(newValId);
                        }
                    }

                    // delete values not in payload (safety check usage)
                    var toDeleteValIds = existingVals.Select(x => x.Id).Where(id => !payloadValIds.Contains(id)).ToList();
                    // Allow value deletions whenever the attribute is included in the payload.
                    // This makes the provided values list authoritative for that attribute.
                    if (toDeleteValIds.Count > 0)
                    {
                        var used = await _context.ProductVariantAttributeValues
                            .AnyAsync(l => toDeleteValIds.Contains(l.ProductAttributeValueId));
                        if (used)
                            return Result.Error($"Cannot delete some values for attribute '{a.Name}' in category '{item.CategoryName}': values are used by product variants");

                        _context.ProductAttributeValues.RemoveRange(
                            _context.ProductAttributeValues.Where(v => toDeleteValIds.Contains(v.Id)));
                        await _context.SaveChangesAsync();
                    }
                }
            }

            // 4) Delete categories not present in payload (safety checks) - only in fullReplace mode
            if (fullReplace)
            {
                var payloadCatIds = new HashSet<string>(resolvedIds, StringComparer.OrdinalIgnoreCase);
                var dbCatIds = (await _context.Categories.Select(c => c.Id).ToListAsync());
                var toDeleteCats = dbCatIds.Where(id => !payloadCatIds.Contains(id)).ToList();
                if (toDeleteCats.Count > 0)
                {
                    foreach (var delId in toDeleteCats)
                    {
                        // block if has children
                        var hasChildren = await _context.Categories.AnyAsync(c => c.ParentCategoryId == delId);
                        if (hasChildren)
                            return Result.Error("Cannot delete a category that has subcategories");

                        // Check attribute value usage by variants
                        var valueIdsQuery = _context.ProductAttributeValues
                            .Where(v => v.ProductAttribute.CategoryId == delId)
                            .Select(v => v.Id);
                        var anyUsed = await _context.ProductVariantAttributeValues
                            .AnyAsync(link => valueIdsQuery.Contains(link.ProductAttributeValueId));
                        if (anyUsed)
                            return Result.Error("Cannot delete category: some attribute values are used by product variants");

                        // Delete values and attributes, then category
                        await _context.ProductAttributeValues.Where(v => v.ProductAttribute.CategoryId == delId).ExecuteDeleteAsync();
                        await _context.ProductAttributes.Where(a => a.CategoryId == delId).ExecuteDeleteAsync();
                        var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Id == delId);
                        if (cat != null) _context.Categories.Remove(cat);
                    }
                    await _context.SaveChangesAsync();
                }
            }

            await tx.CommitAsync();
            return Result.Success("Categories, attributes, and values synchronized successfully");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
    
    public async Task<Result> DeleteAttributeValueAsync(string valueId)
    {
        var entity = await _context.ProductAttributeValues
            .Include(v => v.ProductAttribute)
            .FirstOrDefaultAsync(v => v.Id == valueId);
        if (entity == null)
            return Result.Error("Attribute value not found", 404);

        var used = await _context.ProductVariantAttributeValues
            .AnyAsync(l => l.ProductAttributeValueId == valueId);
        if (used)
            return Result.Error("Cannot delete value: it is used by product variants");

        _context.ProductAttributeValues.Remove(entity);
        await _context.SaveChangesAsync();
        return Result.Success("Attribute value deleted successfully");
    }
}
