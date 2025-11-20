using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Application.utils;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Infrastructure.Contexts;
using ShahAdminFeaturesApi.Core.Models;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class ProductService : IProductService
{
    private readonly ShahDbContext _context;

    public ProductService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<TypedResult<object>> GetProductDetailsByIdAsync(string productId)
    {
        var product = await _context.Products
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Images)
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Reviews)
            .Include(p => p.StoreInfo)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            return TypedResult<object>.Error("Product not found", 404);

        var result = new
        {
            product.Id,
            StoreName = product.StoreInfo.StoreName,
            CategoryName = product.Category.CategoryName,
            Variants = product.ProductVariants.Select(v => new
            {
                v.Id,
                v.Title,
                v.Description,
                v.Stock,
                v.Price,
                Images = v.Images.Select(img => img.ImageUrl).ToList()
            }),
            Reviews = product.ProductVariants
                .SelectMany(v => v.Reviews)
                .Select(r => new
                {
                    r.Id,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    r.Images,
                    Reviewer = new
                    {
                        r.BuyerProfileId,
                    }
                })
        };
        return TypedResult<object>.Success(result);
    }
    
    public async Task<PaginatedResult<object>> GetAllPaginatedProductAsync(string? storeId = null, int page = 1, int pageSize = 5,
        string? categoryId = null, bool includeChildCategories = true)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 15;

        // Build a base query with filters only (no Includes) for accurate counting
        var baseQuery = _context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(storeId))
            baseQuery = baseQuery.Where(p => p.StoreInfoId == storeId);

        if (!string.IsNullOrWhiteSpace(categoryId))
        {
            var categoryIds = new HashSet<string> { categoryId! };
            if (includeChildCategories)
            {
                var all = await _context.Categories
                    .AsNoTracking()
                    .Select(c => new { c.Id, c.ParentCategoryId })
                    .ToListAsync();
                foreach (var id in GetDescendantIds(categoryId!, all))
                    categoryIds.Add(id);
            }
            baseQuery = baseQuery.Where(p => categoryIds.Contains(p.CategoryId));
        }

        // Accurate total count after filters
        var total = await baseQuery.CountAsync();

        // Now build the data query with needed Includes
        var query = baseQuery
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Reviews)
            .Include(p => p.StoreInfo)
            .Include(p => p.Category).ThenInclude(c => c.ParentCategory);

        var pageRows = await query
            .OrderBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                ProductTitle = p.ProductVariants.Select(v => v.Title).FirstOrDefault(),
                RepresentativeVariantId = p.ProductVariants.Select(v => v.Id).FirstOrDefault(),
                StoreName = p.StoreInfo.StoreName,
                Price = p.ProductVariants.Select(v => (decimal?)v.Price).Min() ?? 0m,
                Category = p.Category,
                ReviewsCount = p.ProductVariants.Sum(v => v.Reviews.Count)
            })
            .ToListAsync();

        // Fetch main images for these products in one go
        var variantIds = pageRows.Select(r => r.RepresentativeVariantId).Where(id => !string.IsNullOrWhiteSpace(id)).ToList();
        var mains = await _context.ProductVariantImages
            .Where(img => img.IsMain && variantIds.Contains(img.ProductVariantId))
            .Select(img => new { img.ProductVariantId, img.ImageUrl })
            .ToListAsync();
        var mainLookup = mains
            .GroupBy(x => x.ProductVariantId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.ImageUrl).FirstOrDefault());

        var items = pageRows
            .Select(p => new
            {
                p.Id,
                p.ProductTitle,
                MainImage = (p.RepresentativeVariantId != null && mainLookup.TryGetValue(p.RepresentativeVariantId, out var url)) ? url : null,
                p.StoreName,
                p.Price,
                CategoryName = p.Category.CategoryName,
                CategoryChain = CategoryUtils.GetCategoryChain(p.Category),
                p.ReviewsCount
            })
            .Cast<object>()
            .ToList();

        return PaginatedResult<object>.Success(items, total, page, pageSize);
    }

    // Admin: Create product
    public async Task<TypedResult<object>> CreateProductAsync(AdminCreateProductRequestDTO request)
    {
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists) return TypedResult<object>.Error("Category not found", 404);
        var storeExists = await _context.StoreInfos.AnyAsync(s => s.Id == request.StoreInfoId);
        if (!storeExists) return TypedResult<object>.Error("Store not found", 404);
        if (request.Variants == null || request.Variants.Count == 0)
            return TypedResult<object>.Error("At least one variant is required", 400);

        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var product = new Product
            {
                CategoryId = request.CategoryId,
                StoreInfoId = request.StoreInfoId
            };

            foreach (var v in request.Variants)
            {
                var variant = new ProductVariant
                {
                    ProductId = product.Id,
                    Title = v.Title,
                    Description = v.Description,
                    WeightInGrams = v.WeightInGrams,
                    Stock = v.Stock,
                    Price = v.Price,
                    DiscountPrice = v.DiscountPrice ?? 0m // Map DiscountPrice, default to 0 if null
                };

                if (v.Images != null && v.Images.Count > 0)
                {
                    foreach (var img in v.Images)
                    {
                        if (!string.IsNullOrWhiteSpace(img.ImageUrl))
                        {
                            variant.Images.Add(new ProductVariantImage
                            {
                                ImageUrl = img.ImageUrl,
                                IsMain = img.IsMain
                            });
                        }
                    }
                    var mains = variant.Images.Where(i => i.IsMain).ToList();
                    if (mains.Count > 1)
                    {
                        foreach (var extra in mains.Skip(1)) extra.IsMain = false;
                    }
                    else if (mains.Count == 0 && variant.Images.Count > 0)
                    {
                        variant.Images[0].IsMain = true;
                    }
                }

                if (v.AttributeValueIds != null && v.AttributeValueIds.Count > 0)
                {
                    var existingAttrValueIds = await _context.ProductAttributeValues
                        .AsNoTracking()
                        .Where(pav => v.AttributeValueIds.Contains(pav.Id))
                        .Select(pav => pav.Id)
                        .ToListAsync();

                    foreach (var attrId in existingAttrValueIds)
                    {
                        variant.ProductVariantAttributeValues.Add(new ProductVariantAttributeValue
                        {
                            ProductAttributeValueId = attrId
                        });
                    }
                }

                product.ProductVariants.Add(variant);
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            var payload = new
            {
                product.Id,
                product.CategoryId,
                product.StoreInfoId,
                Variants = product.ProductVariants.Select(v => new
                {
                    v.Id,
                    v.Title,
                    v.Description,
                    v.WeightInGrams,
                    v.Stock,
                    v.Price,
                    Images = v.Images.Select(img => new { img.Id, img.ImageUrl, img.IsMain }).ToList(),
                    AttributeValueIds = v.ProductVariantAttributeValues.Select(x => x.ProductAttributeValueId).ToList()
                }).ToList()
            };

            return TypedResult<object>.Success(payload, "Product created successfully");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return TypedResult<object>.Error($"Failed to add product: {ex.Message}", 500);
        }
    }

    // Admin: Edit product (no seller checks)
    public async Task<TypedResult<object>> EditProductAsync(string productId, AdminEditProductRequestDTO request)
    {
        var product = await _context.Products
            .Include(p => p.ProductVariants).ThenInclude(v => v.Images)
            .Include(p => p.ProductVariants).ThenInclude(v => v.ProductVariantAttributeValues)
            .Include(p => p.ProductVariants).ThenInclude(v => v.OrderItems)
            .FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null) return TypedResult<object>.Error("Product not found", 404);

        if (!string.IsNullOrWhiteSpace(request.CategoryId) && request.CategoryId != product.CategoryId)
        {
            var catExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId);
            if (!catExists) return TypedResult<object>.Error("Category not found", 404);
            product.CategoryId = request.CategoryId!;
        }

        var existingVariants = product.ProductVariants.ToDictionary(v => v.Id, v => v);
        var incomingIds = new HashSet<string>(request.Variants.Select(v => v.Id));

        var toDelete = existingVariants.Keys.Where(id => !incomingIds.Contains(id)).ToList();
        foreach (var delId in toDelete)
        {
            var v = existingVariants[delId];
            if (v.OrderItems.Any())
                return TypedResult<object>.Error($"Cannot delete variant {delId} with existing orders", 400);
            if (v.ProductVariantAttributeValues.Any()) _context.ProductVariantAttributeValues.RemoveRange(v.ProductVariantAttributeValues);
            if (v.Images.Any()) _context.ProductVariantImages.RemoveRange(v.Images);
            _context.ProductVariants.Remove(v);
        }

        foreach (var vReq in request.Variants)
        {
            if (!existingVariants.TryGetValue(vReq.Id, out var variant))
                return TypedResult<object>.Error($"Variant not found: {vReq.Id}", 404);

            variant.Title = string.IsNullOrWhiteSpace(vReq.Title) ? variant.Title : vReq.Title;
            variant.Description = string.IsNullOrWhiteSpace(vReq.Description) ? variant.Description : vReq.Description;
            if (vReq.WeightInGrams.HasValue) variant.WeightInGrams = vReq.WeightInGrams.Value;
            if (vReq.Stock.HasValue) variant.Stock = vReq.Stock.Value;
            if (vReq.Price.HasValue) variant.Price = vReq.Price.Value;
            if (vReq.DiscountPrice.HasValue) variant.DiscountPrice = vReq.DiscountPrice.Value; // Map DiscountPrice

            if (vReq.Images != null)
            {
                var requestedKeep = vReq.Images.Where(i => !i.Delete).ToList();

                var keepIds = new HashSet<string>(requestedKeep.Where(i => !string.IsNullOrWhiteSpace(i.Id)).Select(i => i.Id!));
                var imgsToDelete = variant.Images.Where(i => !keepIds.Contains(i.Id)).ToList();
                if (imgsToDelete.Count > 0) _context.ProductVariantImages.RemoveRange(imgsToDelete);

                var existingImages = variant.Images.ToDictionary(i => i.Id, i => i);
                var matchedImages = new List<ProductVariantImage>();
                foreach (var imgReq in requestedKeep)
                {
                    if (!string.IsNullOrWhiteSpace(imgReq.Id) && existingImages.TryGetValue(imgReq.Id!, out var img))
                    {
                        if (!string.IsNullOrWhiteSpace(imgReq.ImageUrl)) img.ImageUrl = imgReq.ImageUrl!;
                        matchedImages.Add(img);
                    }
                    else
                    {
                        if (string.IsNullOrWhiteSpace(imgReq.ImageUrl)) continue;
                        var created = new ProductVariantImage { ImageUrl = imgReq.ImageUrl!, IsMain = false };
                        variant.Images.Add(created);
                        matchedImages.Add(created);
                    }
                }
                if (matchedImages.Count > 0)
                {
                    var reqMainIndex = requestedKeep.FindIndex(x => x.IsMain);
                    if (reqMainIndex < 0) reqMainIndex = 0;
                    for (int i = 0; i < matchedImages.Count; i++) matchedImages[i].IsMain = (i == reqMainIndex);
                }
            }

            if (vReq.AttributeValueIds != null)
            {
                var currentAttrIds = variant.ProductVariantAttributeValues.Select(x => x.ProductAttributeValueId).ToHashSet();
                var requestedAttrIds = vReq.AttributeValueIds.ToHashSet();
                var attrToRemove = currentAttrIds.Except(requestedAttrIds).ToList();
                var attrToAdd = requestedAttrIds.Except(currentAttrIds).ToList();
                if (attrToRemove.Count > 0)
                {
                    var links = variant.ProductVariantAttributeValues.Where(x => attrToRemove.Contains(x.ProductAttributeValueId)).ToList();
                    _context.ProductVariantAttributeValues.RemoveRange(links);
                }
                foreach (var addId in attrToAdd)
                {
                    variant.ProductVariantAttributeValues.Add(new ProductVariantAttributeValue { ProductAttributeValueId = addId });
                }
            }
        }

        await _context.SaveChangesAsync();

        var updated = new
        {
            product.Id,
            product.CategoryId,
            product.StoreInfoId,
            Variants = product.ProductVariants.Select(v => new
            {
                v.Id,
                v.Title,
                v.Description,
                v.WeightInGrams,
                v.Stock,
                v.Price,
                Images = v.Images.Select(img => new { img.Id, img.ImageUrl, img.IsMain }).ToList(),
                AttributeValueIds = v.ProductVariantAttributeValues.Select(x => x.ProductAttributeValueId).ToList()
            }).ToList()
        };
        return TypedResult<object>.Success(updated, "Product updated successfully");
    }

    // Admin: Delete
    public async Task<Result> DeleteProductAsync(string productId)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var product = await _context.Products
                .Include(p => p.ProductVariants).ThenInclude(v => v.OrderItems)
                .Include(p => p.ProductVariants).ThenInclude(v => v.CartItems)
                .Include(p => p.ProductVariants).ThenInclude(v => v.Favorites)
                .Include(p => p.ProductVariants).ThenInclude(v => v.Reviews)
                .Include(p => p.ProductVariants).ThenInclude(v => v.ProductVariantAttributeValues)
                .Include(p => p.ProductVariants).ThenInclude(v => v.Images)
                .FirstOrDefaultAsync(p => p.Id == productId);
            if (product == null) return Result.Error("Product not found");
            if (product.ProductVariants.Any(v => v.OrderItems.Any()))
                return Result.Error("Cannot delete product with existing orders");

            foreach (var v in product.ProductVariants)
            {
                if (v.Reviews.Any()) _context.Reviews.RemoveRange(v.Reviews);
                if (v.Favorites.Any()) _context.Favorites.RemoveRange(v.Favorites);
                if (v.CartItems.Any()) _context.CartItems.RemoveRange(v.CartItems);
                if (v.ProductVariantAttributeValues.Any()) _context.ProductVariantAttributeValues.RemoveRange(v.ProductVariantAttributeValues);
                if (v.Images.Any()) _context.ProductVariantImages.RemoveRange(v.Images);
            }
            if (product.ProductVariants.Any()) _context.ProductVariants.RemoveRange(product.ProductVariants);
            _context.Products.Remove(product);

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return Result.Success("Product deleted successfully");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return Result.Error($"Failed to delete product: {ex.Message}");
        }
    }

    // Admin: Edit payload
    public async Task<TypedResult<object>> GetProductEditPayloadAsync(string productId)
    {
        var product = await _context.Products
            .Include(p => p.ProductVariants).ThenInclude(v => v.Images)
            .Include(p => p.ProductVariants).ThenInclude(v => v.ProductVariantAttributeValues)
            .FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null) return TypedResult<object>.Error("Product not found", 404);

        var payload = new
        {
            product.Id,
            product.CategoryId,
            product.StoreInfoId,
            Variants = product.ProductVariants.Select(v => new
            {
                v.Id,
                v.Title,
                v.Description,
                v.WeightInGrams,
                v.Stock,
                v.Price,
                Images = v.Images.Select(img => new { img.Id, img.ImageUrl, img.IsMain }).ToList(),
                AttributeValueIds = v.ProductVariantAttributeValues.Select(x => x.ProductAttributeValueId).ToList()
            }).ToList()
        };
        return TypedResult<object>.Success(payload, "Success");
    }

    // Admin: Sync product (overwrite variants to match request)
    public async Task<TypedResult<object>> SyncProductAsync(string productId, AdminSyncProductRequestDTO request)
    {
        var product = await _context.Products
            .Include(p => p.ProductVariants).ThenInclude(v => v.Images)
            .Include(p => p.ProductVariants).ThenInclude(v => v.ProductVariantAttributeValues)
            .Include(p => p.ProductVariants).ThenInclude(v => v.OrderItems)
            .FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null) return TypedResult<object>.Error("Product not found", 404);

        if (!string.IsNullOrWhiteSpace(request.CategoryId) && request.CategoryId != product.CategoryId)
        {
            var catExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId);
            if (!catExists) return TypedResult<object>.Error("Category not found", 404);
            product.CategoryId = request.CategoryId!;
        }

        var existingVariants = product.ProductVariants.ToDictionary(v => v.Id, v => v);
        var incomingIds = new HashSet<string>(request.Variants.Where(v => !string.IsNullOrWhiteSpace(v.Id)).Select(v => v.Id!));

        var toDelete = existingVariants.Keys.Where(id => !incomingIds.Contains(id)).ToList();
        foreach (var delId in toDelete)
        {
            var v = existingVariants[delId];
            if (v.OrderItems.Any())
                return TypedResult<object>.Error($"Cannot delete variant {delId} with existing orders", 400);
            if (v.ProductVariantAttributeValues.Any()) _context.ProductVariantAttributeValues.RemoveRange(v.ProductVariantAttributeValues);
            if (v.Images.Any()) _context.ProductVariantImages.RemoveRange(v.Images);
            _context.ProductVariants.Remove(v);
        }

        foreach (var vReq in request.Variants)
        {
            ProductVariant? existingVariant = null;
            var hasExisting = !string.IsNullOrWhiteSpace(vReq.Id) && existingVariants.TryGetValue(vReq.Id!, out existingVariant);
            ProductVariant variant;
            if (hasExisting && existingVariant != null)
            {
                variant = existingVariant;
                variant.Title = vReq.Title;
                variant.Description = vReq.Description;
                variant.WeightInGrams = vReq.WeightInGrams;
                variant.Stock = vReq.Stock;
                variant.Price = vReq.Price;
                variant.DiscountPrice = vReq.DiscountPrice ?? 0m; // Map DiscountPrice, default to 0 if null
            }
            else
            {
                variant = new ProductVariant
                {
                    ProductId = product.Id,
                    Title = vReq.Title,
                    Description = vReq.Description,
                    WeightInGrams = vReq.WeightInGrams,
                    Stock = vReq.Stock,
                    Price = vReq.Price,
                    DiscountPrice = vReq.DiscountPrice ?? 0m // Map DiscountPrice, default to 0 if null
                };
                product.ProductVariants.Add(variant);
            }

            var currentAttrIds = variant.ProductVariantAttributeValues.Select(x => x.ProductAttributeValueId).ToHashSet();
            var requestedAttrIds = vReq.AttributeValueIds.ToHashSet();
            var attrToRemove = currentAttrIds.Except(requestedAttrIds).ToList();
            var attrToAdd = requestedAttrIds.Except(currentAttrIds).ToList();
            if (attrToRemove.Count > 0)
            {
                var links = variant.ProductVariantAttributeValues.Where(x => attrToRemove.Contains(x.ProductAttributeValueId)).ToList();
                _context.ProductVariantAttributeValues.RemoveRange(links);
            }
            foreach (var addId in attrToAdd)
            {
                variant.ProductVariantAttributeValues.Add(new ProductVariantAttributeValue { ProductAttributeValueId = addId });
            }

            var existingImages = variant.Images.ToDictionary(i => i.Id, i => i);
            var requestImages = vReq.Images;
            var incomingImageIds = new HashSet<string>(requestImages.Where(i => !string.IsNullOrWhiteSpace(i.Id)).Select(i => i.Id!));

            var imageIdsToDelete = existingImages.Keys.Where(id => !incomingImageIds.Contains(id)).ToList();
            if (imageIdsToDelete.Count > 0)
            {
                var imgs = variant.Images.Where(i => imageIdsToDelete.Contains(i.Id)).ToList();
                _context.ProductVariantImages.RemoveRange(imgs);
            }

            var existingImages2 = variant.Images.ToDictionary(i => i.Id, i => i);
            var matched2 = new List<ProductVariantImage>();
            foreach (var imgReq in requestImages)
            {
                if (!string.IsNullOrWhiteSpace(imgReq.Id) && existingImages2.TryGetValue(imgReq.Id!, out var img))
                {
                    img.ImageUrl = imgReq.ImageUrl;
                    matched2.Add(img);
                }
                else
                {
                    var created = new ProductVariantImage { ImageUrl = imgReq.ImageUrl, IsMain = false };
                    variant.Images.Add(created);
                    matched2.Add(created);
                }
            }
            if (matched2.Count > 0)
            {
                var reqMainIndex2 = requestImages.FindIndex(x => x.IsMain);
                if (reqMainIndex2 < 0) reqMainIndex2 = 0;
                for (int i = 0; i < matched2.Count; i++) matched2[i].IsMain = (i == reqMainIndex2);
            }
        }

        await _context.SaveChangesAsync();

        var payload = new
        {
            product.Id,
            product.CategoryId,
            product.StoreInfoId,
            Variants = product.ProductVariants.Select(v => new
            {
                v.Id,
                v.Title,
                v.Description,
                v.WeightInGrams,
                v.Stock,
                v.Price,
                Images = v.Images.Select(img => new { img.Id, img.ImageUrl, img.IsMain }).ToList(),
                AttributeValueIds = v.ProductVariantAttributeValues.Select(x => x.ProductAttributeValueId).ToList()
            }).ToList()
        };
        return TypedResult<object>.Success(payload, "Product synchronized successfully");
    }

    // Admin: product statistics
    public async Task<TypedResult<object>> GetProductStatisticsAsync(string productId, string? productVariantId = null)
    {
        if (string.IsNullOrWhiteSpace(productId))
            return TypedResult<object>.Error("productId is required", 400);

        var productExists = await _context.Products.AsNoTracking().AnyAsync(p => p.Id == productId);
        if (!productExists) return TypedResult<object>.Error("Product not found", 404);

        IQueryable<ProductVariant> variantsQuery = _context.ProductVariants.AsNoTracking().Where(v => v.ProductId == productId);
        if (!string.IsNullOrWhiteSpace(productVariantId)) variantsQuery = variantsQuery.Where(v => v.Id == productVariantId);

        IQueryable<OrderItem> orderItemsQuery = _context.OrderItems.AsNoTracking().Where(oi => oi.ProductVariant.ProductId == productId);
        if (!string.IsNullOrWhiteSpace(productVariantId)) orderItemsQuery = orderItemsQuery.Where(oi => oi.ProductVariantId == productVariantId);

        var totalOrders = await orderItemsQuery.Select(oi => oi.OrderId).Distinct().CountAsync();
        var totalItems = await orderItemsQuery.SumAsync(oi => oi.Quantity);
        var deliveredItems = await orderItemsQuery.Where(oi => oi.Status == Core.Enums.OrderStatus.Delivered).SumAsync(oi => oi.Quantity);
        var cancelledItems = await orderItemsQuery.Where(oi => oi.Status == Core.Enums.OrderStatus.Cancelled).SumAsync(oi => oi.Quantity);
        var deliveredRevenue = await orderItemsQuery
            .Where(oi => oi.Status == Core.Enums.OrderStatus.Delivered)
            .Select(oi => oi.Quantity * oi.ProductVariant.Price)
            .SumAsync();

        var since30 = DateTime.UtcNow.AddDays(-30);
        var last30Query = orderItemsQuery.Where(oi => oi.Order.CreatedAt >= since30);
        var last30Orders = await last30Query.Select(oi => oi.OrderId).Distinct().CountAsync();
        var last30Items = await last30Query.SumAsync(oi => oi.Quantity);
        var last30DeliveredItems = await last30Query.Where(oi => oi.Status == Core.Enums.OrderStatus.Delivered).SumAsync(oi => oi.Quantity);
        var last30Revenue = await last30Query.Where(oi => oi.Status == Core.Enums.OrderStatus.Delivered)
            .Select(oi => oi.Quantity * oi.ProductVariant.Price).SumAsync();

        var since1Day = DateTime.UtcNow.AddDays(-1);
        var last1DayQuery = orderItemsQuery.Where(oi => oi.Order.CreatedAt >= since1Day);
        var last1DayOrders = await last1DayQuery.Select(oi => oi.OrderId).Distinct().CountAsync();
        var last1DayItems = await last1DayQuery.SumAsync(oi => oi.Quantity);
        var last1DayDeliveredItems = await last1DayQuery.Where(oi => oi.Status == Core.Enums.OrderStatus.Delivered).SumAsync(oi => oi.Quantity);
        var last1DayRevenue = await last1DayQuery.Where(oi => oi.Status == Core.Enums.OrderStatus.Delivered)
            .Select(oi => oi.Quantity * oi.ProductVariant.Price).SumAsync();

        var since1Year = DateTime.UtcNow.AddYears(-1);
        var last1YearQuery = orderItemsQuery.Where(oi => oi.Order.CreatedAt >= since1Year);
        var last1YearOrders = await last1YearQuery.Select(oi => oi.OrderId).Distinct().CountAsync();
        var last1YearItems = await last1YearQuery.SumAsync(oi => oi.Quantity);
        var last1YearDeliveredItems = await last1YearQuery.Where(oi => oi.Status == Core.Enums.OrderStatus.Delivered).SumAsync(oi => oi.Quantity);
        var last1YearRevenue = await last1YearQuery.Where(oi => oi.Status == Core.Enums.OrderStatus.Delivered)
            .Select(oi => oi.Quantity * oi.ProductVariant.Price).SumAsync();

        var reviewsQuery = variantsQuery.SelectMany(v => v.Reviews);
        var reviewsCount = await reviewsQuery.CountAsync();
        decimal? averageRating = null;
        if (reviewsCount > 0)
            averageRating = Math.Round(await reviewsQuery.AverageAsync(r => (decimal)r.Rating), 2);
        var favoritesCount = await variantsQuery.SelectMany(v => v.Favorites).CountAsync();

        var stockAvailable = await variantsQuery.SumAsync(v => v.Stock);
        var minPrice = await variantsQuery.MinAsync(v => (decimal?)v.Price) ?? 0m;
        var maxPrice = await variantsQuery.MaxAsync(v => (decimal?)v.Price) ?? 0m;

        var latestReviews = await reviewsQuery
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.ProductVariantId,
                ProductVariantTitle = r.ProductVariant.Title,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                r.Images,
                Reviewer = new { r.BuyerProfileId }
            })
            .Take(20)
            .ToListAsync();

        List<object> topVariants;
        if (string.IsNullOrWhiteSpace(productVariantId))
        {
            topVariants = await _context.OrderItems
                .AsNoTracking()
                .Where(oi => oi.ProductVariant.ProductId == productId && oi.Status == Core.Enums.OrderStatus.Delivered)
                .GroupBy(oi => new { oi.ProductVariantId, oi.ProductVariant.Title })
                .Select(g => new { g.Key.ProductVariantId, g.Key.Title, Quantity = g.Sum(x => x.Quantity) })
                .OrderByDescending(x => x.Quantity)
                .Take(5)
                .Cast<object>()
                .ToListAsync();
        }
        else
        {
            var singleVariantAgg = await _context.OrderItems
                .AsNoTracking()
                .Where(oi => oi.ProductVariantId == productVariantId && oi.Status == Core.Enums.OrderStatus.Delivered)
                .GroupBy(oi => new { oi.ProductVariantId, oi.ProductVariant.Title })
                .Select(g => new { g.Key.ProductVariantId, g.Key.Title, Quantity = g.Sum(x => x.Quantity) })
                .FirstOrDefaultAsync();
            topVariants = new List<object>();
            if (singleVariantAgg != null) topVariants.Add(singleVariantAgg);
        }

        var data = new
        {
            ProductId = productId,
            ProductVariantId = productVariantId,
            Totals = new { Orders = totalOrders, Items = totalItems, DeliveredItems = deliveredItems, CancelledItems = cancelledItems, Revenue = deliveredRevenue },
            Last1Day = new { Orders = last1DayOrders, Items = last1DayItems, DeliveredItems = last1DayDeliveredItems, Revenue = last1DayRevenue },
            Last30Days = new { Orders = last30Orders, Items = last30Items, DeliveredItems = last30DeliveredItems, Revenue = last30Revenue },
            Last1Year = new { Orders = last1YearOrders, Items = last1YearItems, DeliveredItems = last1YearDeliveredItems, Revenue = last1YearRevenue },
            Ratings = new { Average = averageRating, Count = reviewsCount },
            Reviews = new { Count = reviewsCount, Average = averageRating, Latest = latestReviews },
            Favorites = favoritesCount,
            Inventory = new { StockAvailable = stockAvailable, MinPrice = minPrice, MaxPrice = maxPrice },
            TopVariants = topVariants
        };

        return TypedResult<object>.Success(data);
    }
    
    private static IEnumerable<string> GetDescendantIds(string rootId, IEnumerable<dynamic> flat)
    {
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
}
