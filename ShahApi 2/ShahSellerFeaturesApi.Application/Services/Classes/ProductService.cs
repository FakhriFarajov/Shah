using Microsoft.EntityFrameworkCore;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using ShahSellerFeaturesApi.Application.Utils.GetChain;
using ShahSellerFeaturesApi.Core.DTOs.Request;
using ShahSellerFeaturesApi.Core.DTOs.Response;
using ShahSellerFeaturesApi.Infrastructure.Contexts;
using ShahSellerFeaturesApi.Core.Models;

namespace ShahSellerFeaturesApi.Application.Services.Classes;

public class ProductService : IProductService
{
    private readonly ShahDbContext _context;

    public ProductService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<TypedResult<object>> AddProductAsync(CreateProductRequestDTO request)
    {
        // Basic existence checks
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists)
            return TypedResult<object>.Error("Category not found", 404);

        var storeExists = await _context.StoreInfos.AnyAsync(s => s.Id == request.StoreInfoId);
        if (!storeExists)
            return TypedResult<object>.Error("Store not found", 404);

        if (request.Variants.Count == 0)
            return TypedResult<object>.Error("At least one variant is required");

        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var product = new Product
            {
                CategoryId = request.CategoryId,
                StoreInfoId = request.StoreInfoId,
            };

            foreach (var v in request.Variants)
            {
                var variant = new ProductVariant
                {
                    ProductId = product.Id, // Id is pre-initialized as GUID string
                    Title = v.Title,
                    Description = v.Description,
                    WeightInGrams = v.WeightInGrams,
                    Stock = v.Stock,
                    Price = v.Price
                };

                // Images (DTO now includes ImageUrl + IsMain)
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

                    // Normalize: ensure only one main image per variant
                    var mains = variant.Images.Where(i => i.IsMain).ToList();
                    if (mains.Count > 1)
                    {
                        // keep the first as main, others set to false
                        foreach (var extra in mains.Skip(1))
                            extra.IsMain = false;
                    }
                    else if (mains.Count == 0 && variant.Images.Count > 0)
                    {
                        // if none marked as main, set the first image as main
                        variant.Images[0].IsMain = true;
                    }
                }

                // Attribute Values links (optional validation of existence)
                if (v.AttributeValueIds.Count > 0)
                {
                    // Fetch existing ids to avoid FK issues
                    var existingAttrValueIds = await _context.ProductAttributeValues
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

            // Build full response payload
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

    public async Task<TypedResult<object>> GetProductDetailsByIdAsync(string productId) //Correct 
    {
        var product = await _context.Products
            .Include(p => p.ProductVariants)
            .ThenInclude(v => v.Images)
            .Include(p => p.ProductVariants)
            .ThenInclude(v => v.Reviews)
            .ThenInclude(r => r.BuyerProfile)
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
                Images = v.Images.Select(img => new { img.ImageUrl, img.IsMain }).ToList(),
                MainImageUrl = v.Images.FirstOrDefault(i => i.IsMain)?.ImageUrl
            }),
            Reviews = product.ProductVariants
                .SelectMany(v => v.Reviews)
                .Select(r => new
                {
                    r.Id,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
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

    public async Task<TypedResult<List<object>>> GetRandomProductsAsync(int count = 45)
    {
        var totalItems = await _context.Products.CountAsync();
        if (totalItems <= count)
        {
            var products = await _context.Products
                .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Reviews)
                .Include(p => p.StoreInfo)
                .Include(p => p.Category).ThenInclude(c => c.ParentCategory)
                .ToListAsync();
            var random = new Random();
            var shuffled = products.OrderBy(_ => random.Next()).Take(count);
            var result = shuffled.Select(p => new
            {
                p.Id,
                StoreName = p.StoreInfo.StoreName,
                Price = p.ProductVariants.Select(v => (decimal?)v.Price).Min() ?? 0m,
                CategoryName = p.Category.CategoryName,
                CategoryChain = CategoryUtils.GetCategoryChain(p.Category),
                ReviewsCount = p.ProductVariants.Sum(v => v.Reviews.Count)
            }).ToList<object>();
            return TypedResult<List<object>>.Success(result);
        }

        var randomProducts = await _context.Products
            .Include(p => p.ProductVariants)
            .ThenInclude(v => v.Reviews)
            .Include(p => p.StoreInfo)
            .Include(p => p.Category).ThenInclude(c => c.ParentCategory)
            .OrderBy(p => Guid.NewGuid())
            .Take(count)
            .ToListAsync();
        var randomResult = randomProducts.Select(p => new
        {
            p.Id,
            StoreName = p.StoreInfo.StoreName,
            Price = p.ProductVariants.Select(v => (decimal?)v.Price).Min() ?? 0m,
            CategoryName = p.Category.CategoryName,
            CategoryChain = CategoryUtils.GetCategoryChain(p.Category),
            ReviewsCount = p.ProductVariants.Sum(v => v.Reviews.Count)
        }).ToList<object>();
        return TypedResult<List<object>>.Success(randomResult);
    }
    
    public async Task<TypedResult<object>> EditProductAsync(string productId, EditProductRequestDTO request, string sellerProfileId)
    {
        var product = await _context.Products
            .Include(p => p.StoreInfo)
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Images)
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.ProductVariantAttributeValues)
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.OrderItems)
            .FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null)
            return TypedResult<object>.Error("Product not found", 404);
        if (product.StoreInfo == null || product.StoreInfo.SellerProfileId != sellerProfileId)
            return TypedResult<object>.Error("Forbidden", 403);

        // Optional category update
        if (!string.IsNullOrWhiteSpace(request.CategoryId) && request.CategoryId != product.CategoryId)
        {
            var catExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId);
            if (!catExists) return TypedResult<object>.Error("Category not found", 404);
            product.CategoryId = request.CategoryId!;
        }

        // Build map of existing variants
        var existingVariants = product.ProductVariants.ToDictionary(v => v.Id, v => v);
        var incomingIds = new HashSet<string>(request.Variants.Select(v => v.Id));

        // Delete variants missing in request (sync behavior), with safety
        var toDelete = existingVariants.Keys.Where(id => !incomingIds.Contains(id)).ToList();
        foreach (var delId in toDelete)
        {
            var v = existingVariants[delId];
            if (v.OrderItems.Any())
                return TypedResult<object>.Error($"Cannot delete variant {delId} with existing orders", 400);
            // remove related entities explicitly
            if (v.ProductVariantAttributeValues.Any())
                _context.ProductVariantAttributeValues.RemoveRange(v.ProductVariantAttributeValues);
            if (v.Images.Any())
                _context.ProductVariantImages.RemoveRange(v.Images);
            _context.ProductVariants.Remove(v);
        }

        // Upsert existing variants from request
        foreach (var vReq in request.Variants)
        {
            if (!existingVariants.TryGetValue(vReq.Id, out var variant))
                return TypedResult<object>.Error($"Variant not found: {vReq.Id}", 404);

            // Field updates with fallback to existing values
            variant.Title = string.IsNullOrWhiteSpace(vReq.Title) ? variant.Title : vReq.Title;
            variant.Description = string.IsNullOrWhiteSpace(vReq.Description) ? variant.Description : vReq.Description;
            if (vReq.WeightInGrams.HasValue) variant.WeightInGrams = vReq.WeightInGrams.Value;
            if (vReq.Stock.HasValue) variant.Stock = vReq.Stock.Value;
            if (vReq.Price.HasValue) variant.Price = vReq.Price.Value;

            // Treat provided images as the final set to keep (sync behavior)
            if (vReq.Images != null)
            {
                var requestedKeep = vReq.Images
                    .Where(i => !i.Delete)
                    .ToList();

                var keepIds = new HashSet<string>(requestedKeep.Where(i => !string.IsNullOrWhiteSpace(i.Id)).Select(i => i.Id!));
                // Delete images not present in the keep set
                var imgsToDelete = variant.Images.Where(i => !keepIds.Contains(i.Id)).ToList();
                if (imgsToDelete.Count > 0)
                    _context.ProductVariantImages.RemoveRange(imgsToDelete);

                // Upsert images in keep set
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
                        if (string.IsNullOrWhiteSpace(imgReq.ImageUrl))
                            continue; // skip invalid new image without URL
                        var created = new ProductVariantImage
                        {
                            ImageUrl = imgReq.ImageUrl!,
                            IsMain = false
                        };
                        variant.Images.Add(created);
                        matchedImages.Add(created);
                    }
                }
                // Set IsMain exactly per request (first true wins; else index 0 if any)
                if (matchedImages.Count > 0)
                {
                    var reqMainIndex = requestedKeep.FindIndex(x => x.IsMain == true);
                    if (reqMainIndex < 0) reqMainIndex = 0;
                    for (int i = 0; i < matchedImages.Count; i++)
                        matchedImages[i].IsMain = (i == reqMainIndex);
                }

            }
        }
        
        await _context.SaveChangesAsync();
        
        // Build and return full updated payload
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

    public async Task<Result> DeleteProductAsync(string productId, string sellerProfileId)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var product = await _context.Products
                .Include(p => p.StoreInfo)
                .Include(p => p.ProductVariants)
                .ThenInclude(v => v.OrderItems)
                .Include(p => p.ProductVariants)
                .ThenInclude(v => v.CartItems)
                .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Favorites)
                .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Reviews)
                .Include(p => p.ProductVariants)
                .ThenInclude(v => v.ProductVariantAttributeValues)
                .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Images)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
                return Result.Error("Product not found");
            if (product.StoreInfo == null || product.StoreInfo.SellerProfileId != sellerProfileId)
                return Result.Error("Forbidden");

            // Block deletion if there are existing order items
            if (product.ProductVariants.Any(v => v.OrderItems.Any()))
                return Result.Error("Cannot delete product with existing orders");

            foreach (var v in product.ProductVariants)
            {
                if (v.Reviews.Any()) _context.Reviews.RemoveRange(v.Reviews);
                if (v.Favorites.Any()) _context.Favorites.RemoveRange(v.Favorites);
                if (v.CartItems.Any()) _context.CartItems.RemoveRange(v.CartItems);
                if (v.ProductVariantAttributeValues.Any())
                    _context.ProductVariantAttributeValues.RemoveRange(v.ProductVariantAttributeValues);
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

    public async Task<TypedResult<object>> GetProductEditPayloadAsync(string productId)
    {
        var product = await _context.Products
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Images)
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.ProductVariantAttributeValues)
            .FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null)
            return TypedResult<object>.Error("Product not found", 404);

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

    public async Task<TypedResult<object>> SyncProductAsync(string productId, SyncProductRequestDTO request, string sellerProfileId)
    {
        // Load product with all data needed for sync
        var product = await _context.Products
            .Include(p => p.StoreInfo)
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Images)
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.ProductVariantAttributeValues)
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.OrderItems)
            .FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null)
            return TypedResult<object>.Error("Product not found", 404);
        if (product.StoreInfo == null || product.StoreInfo.SellerProfileId != sellerProfileId)
            return TypedResult<object>.Error("Forbidden", 403);

        // Optional category update
        if (!string.IsNullOrWhiteSpace(request.CategoryId) && request.CategoryId != product.CategoryId)
        {
            var catExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId);
            if (!catExists) return TypedResult<object>.Error("Category not found", 404);
            product.CategoryId = request.CategoryId!;
        }

        // Map of existing variants by Id
        var existingVariants = product.ProductVariants.ToDictionary(v => v.Id, v => v);
        var incomingIds = new HashSet<string>(request.Variants.Where(v => !string.IsNullOrWhiteSpace(v.Id)).Select(v => v.Id!));

        // Determine variants to delete
        var toDelete = existingVariants.Keys.Where(id => !incomingIds.Contains(id)).ToList();
        // Safety: prevent deletion if there are order items
        foreach (var delId in toDelete)
        {
            var v = existingVariants[delId];
            if (v.OrderItems.Any())
                return TypedResult<object>.Error($"Cannot delete variant {delId} with existing orders", 400);
        }
        // Perform deletions of variants and their relations (images + attribute links). Cascade may exist, but remove explicitly for clarity
        foreach (var delId in toDelete)
        {
            var v = existingVariants[delId];
            if (v.ProductVariantAttributeValues.Any())
                _context.ProductVariantAttributeValues.RemoveRange(v.ProductVariantAttributeValues);
            if (v.Images.Any())
                _context.ProductVariantImages.RemoveRange(v.Images);
            _context.ProductVariants.Remove(v);
        }

        // Upsert incoming variants
        foreach (var vReq in request.Variants)
        {
            ProductVariant? existingVariant = null;
            var hasExisting = !string.IsNullOrWhiteSpace(vReq.Id) && existingVariants.TryGetValue(vReq.Id!, out existingVariant);

            ProductVariant variant;
            if (hasExisting && existingVariant != null)
            {
                variant = existingVariant;
                // Update basic fields
                variant.Title = vReq.Title;
                variant.Description = vReq.Description;
                variant.WeightInGrams = vReq.WeightInGrams;
                variant.Stock = vReq.Stock;
                variant.Price = vReq.Price;
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
                    Price = vReq.Price
                };
                product.ProductVariants.Add(variant);
            }

            // Sync AttributeValueIds (overwrite)
            var currentAttrIds = variant.ProductVariantAttributeValues
                .Select(x => x.ProductAttributeValueId)
                .ToHashSet();
            var requestedAttrIds = vReq.AttributeValueIds?.ToHashSet() ?? new HashSet<string>();

            var attrToRemove = currentAttrIds.Except(requestedAttrIds).ToList();
            var attrToAdd = requestedAttrIds.Except(currentAttrIds).ToList();

            if (attrToRemove.Count > 0)
            {
                var links = variant.ProductVariantAttributeValues
                    .Where(x => attrToRemove.Contains(x.ProductAttributeValueId))
                    .ToList();
                _context.ProductVariantAttributeValues.RemoveRange(links);
            }
            foreach (var addId in attrToAdd)
            {
                variant.ProductVariantAttributeValues.Add(new ProductVariantAttributeValue
                {
                    ProductAttributeValueId = addId
                });
            }

            // Sync Images by Id
            var existingImages = variant.Images.ToDictionary(i => i.Id, i => i);
            var requestImages = vReq.Images ?? new List<SyncProductImageDTO>();
            var incomingImageIds = new HashSet<string>(requestImages.Where(i => !string.IsNullOrWhiteSpace(i.Id)).Select(i => i.Id!));

            // Remove images missing in request
            var imageIdsToDelete = existingImages.Keys.Where(id => !incomingImageIds.Contains(id)).ToList();
            if (imageIdsToDelete.Count > 0)
            {
                var imgs = variant.Images.Where(i => imageIdsToDelete.Contains(i.Id)).ToList();
                _context.ProductVariantImages.RemoveRange(imgs);
            }

            // Upsert images
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
                    var created = new ProductVariantImage
                    {
                        ImageUrl = imgReq.ImageUrl,
                        IsMain = false
                    };
                    variant.Images.Add(created);
                    matched2.Add(created);
                }
            }

            // Set IsMain exactly per request (first true wins; else index 0 if any)
            if (matched2.Count > 0)
            {
                var reqMainIndex2 = requestImages.FindIndex(x => x.IsMain);
                if (reqMainIndex2 < 0) reqMainIndex2 = 0;
                for (int i = 0; i < matched2.Count; i++)
                    matched2[i].IsMain = (i == reqMainIndex2);
            }
        }

        await _context.SaveChangesAsync();

        // Return full payload
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
