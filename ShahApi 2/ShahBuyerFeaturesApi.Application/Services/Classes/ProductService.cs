using Microsoft.EntityFrameworkCore;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Application.Utils.GetChain;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;
using ShahBuyerFeaturesApi.Core.DTOs.Request;
using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Application.Services.Classes;

public class ProductService : IProductService
{
    private readonly ShahDbContext _context;

    public ProductService(ShahDbContext context)
    {
        _context = context;
    }
    
    public async Task<TypedResult<object>> GetProductDetailsByIdAsync(string productId, string? userId = null)
    {
        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Images)
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.ProductVariantAttributeValues)
                    .ThenInclude(vav => vav.ProductAttributeValue)
                        .ThenInclude(pav => pav.ProductAttribute)
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Reviews)
                    .ThenInclude(r => r.BuyerProfile)
                        .ThenInclude(bp => bp.User)
            .Include(p => p.StoreInfo)
            .Include(p => p.Category).ThenInclude(c => c.ParentCategory)
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            return TypedResult<object>.Error("Product not found", 404);

        var variantIds = product.ProductVariants.Select(v => v.Id).ToList();
        // cache representative variant and its images to avoid repeated enumerations
        var repVariant = product.ProductVariants.FirstOrDefault();
        var representativeVariantId = repVariant?.Id;
        // materialize images to avoid multiple enumeration and EF deferred execution issues
        var repImages = (repVariant?.Images != null) ? repVariant.Images.ToList() : new List<ProductVariantImage>();

        // load buyer-specific favorites and cart items for the representative variants
        var favorites = new HashSet<string>();
        var cartSet = new HashSet<string>();
        if (!string.IsNullOrWhiteSpace(userId) && variantIds.Count > 0)
        {
            var favs = await _context.Favorites
                .AsNoTracking()
                .Where(f => f.BuyerProfileId == userId && variantIds.Contains(f.ProductVariantId))
                .Select(f => f.ProductVariantId)
                .ToListAsync();
            favorites = favs.ToHashSet();

            var carts = await _context.CartItems
                .AsNoTracking()
                .Where(ci => ci.BuyerProfileId == userId && variantIds.Contains(ci.ProductVariantId))
                .Select(ci => ci.ProductVariantId)
                .ToListAsync();
            cartSet = carts.ToHashSet();
        }

        // Build result DTO in-memory (safe to use helper methods like CategoryUtils here)
        var result = new
        {
            product.Id,
            productVariantId = representativeVariantId,
            ProductTitle = repVariant?.Title,
            Description = repVariant?.Description,
            Store = product.StoreInfo != null ? new { product.StoreInfo.Id, product.StoreInfo.StoreName } : null,
            Price = product.ProductVariants.Select(v => (decimal?)v.Price).Min() ?? 0m,
            DiscountPrice = repVariant?.DiscountPrice,
            Images = repImages.Select(i => new { i.Id, i.ImageUrl, i.IsMain }).ToList(),
            MainImage = repImages.FirstOrDefault(i => i.IsMain)?.ImageUrl ?? repImages.FirstOrDefault()?.ImageUrl,
            ReviewsCount = product.ProductVariants.Sum(v => v.Reviews.Count),
            AverageRating = product.ProductVariants.Sum(v => v.Reviews.Count) > 0
                ? (double)product.ProductVariants.Sum(v => v.Reviews.Sum(r => r.Rating)) / product.ProductVariants.Sum(v => v.Reviews.Count)
                : 0.0,
            IsInCart = !string.IsNullOrWhiteSpace(representativeVariantId) && cartSet.Contains(representativeVariantId),
            IsFavorite = !string.IsNullOrWhiteSpace(representativeVariantId) && favorites.Contains(representativeVariantId),
            stock = product.ProductVariants.Sum(v => v.Stock),
            CategoryName = product.Category?.CategoryName,
            CategoryChain = CategoryUtils.GetCategoryChain(product.Category),

            // all variant ids of this product
            VariantIds = product.ProductVariants.Select(v => v.Id).ToList(),

            Variants = product.ProductVariants.Select(v => new
            {
                v.Id,
                v.Title,
                v.Description,
                v.Price,
                v.DiscountPrice,
                v.Stock,
                // sibling variant ids (other variants of the same product)
                SiblingVariantIds = product.ProductVariants.Where(x => x.Id != v.Id).Select(x => x.Id).ToList(),
                // Variant-level image objects (Id, ImageUrl, IsMain)
                Images = v.Images.Select(i => new { i.Id, i.ImageUrl, i.IsMain }).ToList(),
                Attributes = v.ProductVariantAttributeValues.Select(av => new
                {
                    AttributeId = av.ProductAttributeValue?.ProductAttribute?.Id,
                    AttributeName = av.ProductAttributeValue?.ProductAttribute?.Name,
                    ValueId = av.ProductAttributeValueId,
                    Value = av.ProductAttributeValue != null ? av.ProductAttributeValue.Value : null
                }).ToList(),
                ReviewsCount = v.Reviews.Count,
                AverageRating = v.Reviews.Any() ? v.Reviews.Average(r => r.Rating) : 0.0,
                IsFavorite = favorites.Contains(v.Id),
                IsInCart = cartSet.Contains(v.Id)
            }).ToList()
        };

        return TypedResult<object>.Success(result);
    }
    
    public async Task<PaginatedResult<object>> GetRandomProductsAsync(int page = 1, int pageSize = 20, string? userId = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 15;

        var totalItems = await _context.Products.CountAsync();
        if (totalItems == 0)
            return PaginatedResult<object>.Success(Enumerable.Empty<object>(), 0, page, pageSize);

        var randomPageRows = await _context.Products
            .Include(p => p.ProductVariants).ThenInclude(v => v.Reviews)
            .Include(p => p.ProductVariants).ThenInclude(v => v.Favorites)
            .Include(p => p.ProductVariants).ThenInclude(v => v.CartItems)
            .Include(p => p.StoreInfo)
            .Include(p => p.Category).ThenInclude(c => c.ParentCategory)
            .OrderBy(p => Guid.NewGuid())
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                ProductTitle = p.ProductVariants.Select(v => v.Title).FirstOrDefault(),
                Description = p.ProductVariants.Select(v => v.Description).FirstOrDefault(),
                RepresentativeVariantId = p.ProductVariants.Select(v => v.Id).FirstOrDefault(),
                StoreName = p.StoreInfo.StoreName,
                Price = p.ProductVariants.Select(v => (decimal?)v.Price).Min() ?? 0m,
                DiscountPrice = p.ProductVariants.Select(v => (decimal?)v.DiscountPrice).Min() ?? 0m,
                Category = p.Category,
                ReviewsCount = p.ProductVariants.Sum(v => v.Reviews.Count),
                AverageRating = p.ProductVariants.Sum(v => v.Reviews.Count) > 0
                    ? (double)p.ProductVariants.Sum(v => v.Reviews.Sum(r => r.Rating)) / p.ProductVariants.Sum(v => v.Reviews.Count)
                    : 0.0
            })
            .ToListAsync();

        var variantIds = randomPageRows.Select(r => r.RepresentativeVariantId).Where(id => !string.IsNullOrWhiteSpace(id)).ToList();

        var mains = new List<(string ProductVariantId, string ImageUrl)>();
        if (variantIds.Count > 0)
        {
            var rawMains = await _context.ProductVariantImages
                .Where(img => img.IsMain && variantIds.Contains(img.ProductVariantId))
                .Select(img => new { img.ProductVariantId, img.ImageUrl })
                .AsNoTracking()
                .ToListAsync();
            mains = rawMains.Select(x => (x.ProductVariantId, x.ImageUrl)).ToList();
        }
        var mainLookup = mains.GroupBy(x => x.ProductVariantId).ToDictionary(g => g.Key, g => g.Select(x => x.ImageUrl).FirstOrDefault());

        // fetch all images for representative variants so we can return an images list in the DTO
        var imagesByVariant = new Dictionary<string, List<string>>();
        if (variantIds.Count > 0)
        {
            var allImgs = await _context.ProductVariantImages
                .Where(img => variantIds.Contains(img.ProductVariantId))
                .Select(img => new { img.ProductVariantId, img.ImageUrl })
                .AsNoTracking()
                .ToListAsync();
            imagesByVariant = allImgs.GroupBy(x => x.ProductVariantId)
                .ToDictionary(g => g.Key, g => g.Select(i => i.ImageUrl).ToList());
        }

        // load buyer-specific favorites
        var favorites = new HashSet<string>();
        var cartSetForPage = new HashSet<string>();
        if (!string.IsNullOrWhiteSpace(userId) && variantIds.Count > 0)
        {
            var favs = await _context.Favorites
                .AsNoTracking()
                .Where(f => f.BuyerProfileId == userId && variantIds.Contains(f.ProductVariantId))
                .Select(f => f.ProductVariantId)
                .ToListAsync();
            favorites = favs.ToHashSet();

            var carts = await _context.CartItems
                .AsNoTracking()
                .Where(ci => ci.BuyerProfileId == userId && variantIds.Contains(ci.ProductVariantId))
                .Select(ci => ci.ProductVariantId)
                .ToListAsync();
            cartSetForPage = carts.ToHashSet();
        }

        var items = randomPageRows.Select(p => new
        {
            p.Id,
            p.ProductTitle,
            p.Description,
            p.RepresentativeVariantId,
            MainImage = (p.RepresentativeVariantId != null && mainLookup.TryGetValue(p.RepresentativeVariantId, out var url)) ? url : null,
            Images = (p.RepresentativeVariantId != null && imagesByVariant.TryGetValue(p.RepresentativeVariantId, out var imgs)) ? imgs : new List<string>(),
            p.StoreName,
            p.Price,
            p.DiscountPrice,
            CategoryName = p.Category?.CategoryName,
            CategoryChain = CategoryUtils.GetCategoryChain(p.Category),
            p.ReviewsCount,
            p.AverageRating,
            IsFavorite = (favorites.Contains(p.RepresentativeVariantId)),
            IsInCart = (cartSetForPage.Contains(p.RepresentativeVariantId))
        }).Cast<object>().ToList();

        return PaginatedResult<object>.Success(items, totalItems, page, pageSize);
    }

    public async Task<PaginatedResult<object>> GetAllPaginatedProductsFilteredAsync(ProductFilterRequestDTO request)
    {
        int page = request.Page <= 0 ? 1 : request.Page;
        int pageSize = request.PageSize <= 0 ? 15 : request.PageSize;

        IQueryable<Product> baseQuery = _context.Products.AsNoTracking();
        
        if (!string.IsNullOrWhiteSpace(request.CategoryId))
        {
            var categoryIds = new HashSet<string> { request.CategoryId };

            if (request.IncludeChildCategories)
            {
                var allCats = await _context.Categories
                    .Select(c => new { c.Id, c.ParentCategoryId })
                    .ToListAsync();

                foreach (var id in GetDescendantIds(request.CategoryId, allCats))
                    categoryIds.Add(id);
            }

            baseQuery = baseQuery.Where(p => categoryIds.Contains(p.CategoryId));
        }
        if (request.MinPrice.HasValue || request.MaxPrice.HasValue)
        {
            var min = request.MinPrice;
            var max = request.MaxPrice;

            baseQuery = baseQuery.Where(p =>
                p.ProductVariants
                    .Any(v =>
                        (!min.HasValue || v.Price >= min.Value) &&
                        (!max.HasValue || v.Price <= max.Value)
                    )
            );
        }

        if (request.ValueIds is { Count: > 0 })
        {
            var cleaned = request.ValueIds
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Select(id => id.Trim())
                .Distinct()
                .ToList();

            if (cleaned.Count > 0)
            {
                // Fetch values → so we know which attribute each value belongs to
                var values = await _context.ProductAttributeValues
                    .Where(v => cleaned.Contains(v.Id))
                    .Select(v => new { v.Id, v.ProductAttributeId })
                    .AsNoTracking()
                    .ToListAsync();

                // Group selected values by AttributeId
                var groups = values.GroupBy(v => v.ProductAttributeId);

                // For each attribute group → OR logic
                foreach (var group in groups)
                {
                    var valueIdsOfThisAttribute =
                        group.Select(v => v.Id).ToList();

                    // Product must have ANY of these values for this attribute
                    baseQuery = baseQuery.Where(p =>
                        p.ProductVariants.Any(v =>
                            v.ProductVariantAttributeValues
                                .Any(av => valueIdsOfThisAttribute.Contains(av.ProductAttributeValueId))
                        )
                    );
                }
            }
        }


        int total = await baseQuery.CountAsync();

        var products = await baseQuery
            .Include(p => p.ProductVariants)
            .ThenInclude(v => v.Reviews)
            .Include(p => p.ProductVariants)
            .ThenInclude(v => v.Favorites)
            .Include(p => p.ProductVariants)
            .ThenInclude(v => v.CartItems)
            .Include(p => p.Category)
            .Include(p => p.StoreInfo)
            .OrderBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var variantIds = products
            .Select(p => p.ProductVariants.OrderBy(v => v.Price).FirstOrDefault()?.Id)
            .Where(id => id != null)
            .ToList();

        // MAIN IMAGES
        var mainImages = await _context.ProductVariantImages
            .AsNoTracking()
            .Where(i => i.IsMain && variantIds.Contains(i.ProductVariantId))
            .ToListAsync();

        var allImages = await _context.ProductVariantImages
            .AsNoTracking()
            .Where(i => variantIds.Contains(i.ProductVariantId))
            .ToListAsync();

        var favSet = new HashSet<string>();
        var cartSet = new HashSet<string>();

        if (!string.IsNullOrWhiteSpace(request.UserId))
        {
            favSet = (await _context.Favorites
                .Where(f => f.BuyerProfileId == request.UserId && variantIds.Contains(f.ProductVariantId))
                .Select(f => f.ProductVariantId)
                .ToListAsync()).ToHashSet();

            cartSet = (await _context.CartItems
                .Where(c => c.BuyerProfileId == request.UserId && variantIds.Contains(c.ProductVariantId))
                .Select(c => c.ProductVariantId)
                .ToListAsync()).ToHashSet();
        }

        var items = products.Select(p =>
        {
            var repVariant = p.ProductVariants.OrderBy(v => v.Price).FirstOrDefault();
            var repId = repVariant?.Id;

            return new
            {
                p.Id,
                ProductTitle = repVariant?.Title,
                RepresentativeVariantId = repId,
                Description = repVariant?.Description,
                StoreName = p.StoreInfo.StoreName,

                Price = p.ProductVariants.Min(v => v.Price),
                DiscountPrice = p.ProductVariants.Min(v => v.DiscountPrice),

                CategoryName = p.Category?.CategoryName,
                CategoryChain = CategoryUtils.GetCategoryChain(p.Category),

                ReviewsCount = p.ProductVariants.Sum(v => v.Reviews.Count),
                AverageRating =
                    p.ProductVariants.SelectMany(v => v.Reviews).Any()
                        ? p.ProductVariants.SelectMany(v => v.Reviews).Average(r => r.Rating)
                        : 0,

                MainImage = mainImages.FirstOrDefault(m => m.ProductVariantId == repId)?.ImageUrl,
                Images = allImages
                    .Where(img => img.ProductVariantId == repId)
                    .Select(img => img.ImageUrl)
                    .ToList(),

                IsFavorite = repId != null && favSet.Contains(repId),
                IsInCart = repId != null && cartSet.Contains(repId)
            };
        }).Cast<object>().ToList();

        return PaginatedResult<object>.Success(items, total, page, pageSize);
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

    // wrapper to match interface
    public async Task<TypedResult<object>> GetVariantByAttributesAsync(string productId, List<string> attributeValueIds, string? userId = null)
    {
        if (string.IsNullOrWhiteSpace(productId))
            return TypedResult<object>.Error("productId is required", 400);
        if (attributeValueIds == null || attributeValueIds.Count == 0)
            return TypedResult<object>.Error("attributeValueIds are required", 400);

        // find variants of the product that contain all requested attribute value ids
        var candidates = _context.ProductVariants
            .Where(v => v.ProductId == productId)
            .Include(v => v.Images)
            .Include(v => v.ProductVariantAttributeValues)
                .ThenInclude(vav => vav.ProductAttributeValue)
                    .ThenInclude(pav => pav.ProductAttribute)
            .Include(v => v.Reviews)
                .ThenInclude(r => r.BuyerProfile)
                    .ThenInclude(bp => bp.User);

        // filter: variant must have all attributeValueIds
        // Use count of matching attribute values equal to requested count
        var attributeCount = attributeValueIds.Count;
        var matched = await candidates
            .Where(v => v.ProductVariantAttributeValues.Count(av => attributeValueIds.Contains(av.ProductAttributeValueId)) == attributeCount)
            .FirstOrDefaultAsync();

        if (matched == null)
            return TypedResult<object>.Error("Variant not found for given attributes", 404);

        // determine favorite/cart status for this variant for the user
        var isFav = false;
        var isInCart = false;
        if (!string.IsNullOrWhiteSpace(userId))
        {
            isFav = await _context.Favorites.AnyAsync(f => f.BuyerProfileId == userId && f.ProductVariantId == matched.Id);
            isInCart = await _context.CartItems.AnyAsync(ci => ci.BuyerProfileId == userId && ci.ProductVariantId == matched.Id);
        }

        var dto = new
        {
            matched.Id,
            matched.Title,
            matched.Description,
            matched.Price,
            matched.DiscountPrice,
            matched.Stock,
            Images = matched.Images.Select(i => i.ImageUrl).Where(u => !string.IsNullOrWhiteSpace(u)).Distinct().ToList(),
            Attributes = matched.ProductVariantAttributeValues.Select(av => new
            {
                AttributeId = av.ProductAttributeValue?.ProductAttribute?.Id,
                AttributeName = av.ProductAttributeValue?.ProductAttribute?.Name,
                ValueId = av.ProductAttributeValueId,
                Value = av.ProductAttributeValue != null ? av.ProductAttributeValue.Value : null
            }).ToList(),
            Reviews = matched.Reviews.Select(r => new
            {
                r.Id,
                r.BuyerProfileId,
                BuyerName = r.BuyerProfile != null && r.BuyerProfile.User != null ? (r.BuyerProfile.User.Name + " " + r.BuyerProfile.User.Surname).Trim() : null,
                r.Rating,
                r.Comment,
                r.Images,
                r.CreatedAt
            }).OrderByDescending(r => r.CreatedAt).ToList(),
            ReviewsCount = matched.Reviews.Count,
            AverageRating = matched.Reviews.Average(r => r.Rating),
            IsFavorite = isFav,
            IsInCart = isInCart
        };

        return TypedResult<object>.Success(dto);
    }
    
    
    public async Task<PaginatedResult<object>> SearchProductsByTitleAsync(string title, int page = 1, int pageSize = 20, string? userId = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            return PaginatedResult<object>.Error("Product title is required", 400);
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.ProductVariants).ThenInclude(v => v.Images)
            .Include(p => p.ProductVariants).ThenInclude(v => v.Reviews)
            .Include(p => p.StoreInfo)
            .Include(p => p.Category)
            .Where(p => p.ProductVariants.Any(v => EF.Functions.Like(v.Title, $"%{title}%")));

        var total = await query.CountAsync();

        var productsList = await query
            .OrderBy(p => p.ProductVariants.Select(v => v.Title).FirstOrDefault())
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new {
                p.Id,
                ProductTitle = p.ProductVariants.Select(v => v.Title).FirstOrDefault(),
                Description = p.ProductVariants.Select(v => v.Description).FirstOrDefault(),
                RepresentativeVariantId = p.ProductVariants.Select(v => v.Id).FirstOrDefault(),
                StoreName = p.StoreInfo.StoreName,
                Price = p.ProductVariants.Select(v => (decimal?)v.Price).Min() ?? 0m,
                DiscountPrice = p.ProductVariants.Select(v => (decimal?)v.DiscountPrice).Min() ?? 0m,
                Category = p.Category,
                ReviewsCount = p.ProductVariants.Sum(v => v.Reviews.Count),
                AverageRating = p.ProductVariants.Sum(v => v.Reviews.Count) > 0 ? (double)p.ProductVariants.Sum(v => v.Reviews.Sum(r => r.Rating)) / p.ProductVariants.Sum(v => v.Reviews.Count) : 0.0
            })
            .ToListAsync();

        var variantIds = productsList.Select(r => r.RepresentativeVariantId).Where(id => !string.IsNullOrWhiteSpace(id)).ToList();

        var mains = new List<(string ProductVariantId, string ImageUrl)>();
        if (variantIds.Count > 0)
        {
            var rawMains = await _context.ProductVariantImages
                .Where(img => img.IsMain && variantIds.Contains(img.ProductVariantId))
                .Select(img => new { img.ProductVariantId, img.ImageUrl })
                .AsNoTracking()
                .ToListAsync();
            mains = rawMains.Select(x => (x.ProductVariantId, x.ImageUrl)).ToList();
        }
        var mainLookup = mains.GroupBy(x => x.ProductVariantId).ToDictionary(g => g.Key, g => g.Select(x => x.ImageUrl).FirstOrDefault());

        var imagesByVariant = new Dictionary<string, List<string>>();
        if (variantIds.Count > 0)
        {
            var allImgs = await _context.ProductVariantImages
                .Where(img => variantIds.Contains(img.ProductVariantId))
                .Select(img => new { img.ProductVariantId, img.ImageUrl })
                .AsNoTracking()
                .ToListAsync();
            imagesByVariant = allImgs.GroupBy(x => x.ProductVariantId)
                .ToDictionary(g => g.Key, g => g.Select(i => i.ImageUrl).ToList());
        }

        var favorites = new HashSet<string>();
        var cartSetForPage = new HashSet<string>();
        if (!string.IsNullOrWhiteSpace(userId) && variantIds.Count > 0)
        {
            var favs = await _context.Favorites
                .AsNoTracking()
                .Where(f => f.BuyerProfileId == userId && variantIds.Contains(f.ProductVariantId))
                .Select(f => f.ProductVariantId)
                .ToListAsync();
            favorites = favs.ToHashSet();

            var carts = await _context.CartItems
                .AsNoTracking()
                .Where(ci => ci.BuyerProfileId == userId && variantIds.Contains(ci.ProductVariantId))
                .Select(ci => ci.ProductVariantId)
                .ToListAsync();
            cartSetForPage = carts.ToHashSet();
        }

        var items = productsList
            .Select((p, idx) => new
            {
                p.Id,
                p.ProductTitle,
                p.Description,
                p.RepresentativeVariantId,
                MainImage = (p.RepresentativeVariantId != null && mainLookup.TryGetValue(p.RepresentativeVariantId, out var url)) ? url : null,
                Images = (p.RepresentativeVariantId != null && imagesByVariant.TryGetValue(p.RepresentativeVariantId, out var imgs)) ? imgs : new List<string>(),
                p.StoreName,
                p.Price,
                p.DiscountPrice,
                CategoryName = p.Category?.CategoryName,
                CategoryChain = CategoryUtils.GetCategoryChain(p.Category),
                p.ReviewsCount,
                p.AverageRating,
                IsFavorite = (p.RepresentativeVariantId != null && favorites.Contains(p.RepresentativeVariantId)),
                IsInCart = (p.RepresentativeVariantId != null && cartSetForPage.Contains(p.RepresentativeVariantId))
            })
            .Cast<object>()
            .ToList();

        return PaginatedResult<object>.Success(items, total, page, pageSize);
    }
}
