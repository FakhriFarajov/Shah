using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Application.utils;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class ProductService : IProductService
{
    private readonly ShahDbContext _context;

    public ProductService(ShahDbContext context)
    {
        _context = context;
    }

    public async Task<TypedResult<object>> GetProductDetailsByIdAsync(string productId) //Correct 
    {
        var product = await _context.Products
            .Include(p => p.ProductDetails)
            .Include(p => p.ProductVariants)
                .ThenInclude(v => v.Images)
            .Include(p => p.StoreInfo)
            .Include(p => p.Category)
            .Include(p => p.Reviews)
                .ThenInclude(r => r.BuyerProfile)
            .FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null)
            return TypedResult<object>.Error("Product not found", 404);

        var result = new
        {
            product.Id,
            Title = product.ProductDetails.Title,
            Description = product.ProductDetails.Description,
            StoreName = product.StoreInfo?.StoreName,
            CategoryName = product.Category?.CategoryName,
            ProductDetails = new
            {
                product.ProductDetails.Id,
                product.ProductDetails.Title,
                product.ProductDetails.Description,
            },
            Variants = product.ProductVariants.Select(v => new
            {
                v.Id,
                v.Stock,
                v.Price,
                Images = v.Images.Select(img => img.ImageUrl).ToList()
            }),
            Reviews = product.Reviews.Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                Reviewer = new
                {
                    r.BuyerProfileId,
                    // Add more reviewer info if needed
                }
            })
        };
        return TypedResult<object>.Success(result);
    }
    
    public async Task<TypedResult<List<object>>> GetRandomProductsAsync(int count = 45)
    {
        var totalItems = await _context.Products.CountAsync();
        if (totalItems <= count)
        {
            var products = await _context.Products
                .Include(p => p.ProductVariants)
                .Include(p => p.StoreInfo)
                .Include(p => p.Category).ThenInclude(c => c.ParentCategory)
                .Include(p => p.Reviews)
                .ToListAsync();
            var random = new Random();
            var shuffled = products.OrderBy(x => random.Next()).Take(count);
            var result = shuffled.Select(p => new
            {
                p.Id,
                StoreName = p.StoreInfo?.StoreName,
                Price = p.ProductVariants.FirstOrDefault()?.Price ?? 0,
                CategoryName = p.Category?.CategoryName,
                CategoryChain = CategoryUtils.GetCategoryChain(p.Category),
                ReviewsCount = p.Reviews.Count
            }).ToList<object>();
            return TypedResult<List<object>>.Success(result);
        }
        var randomProducts = await _context.Products
            .Include(p => p.ProductVariants)
            .Include(p => p.StoreInfo)
            .Include(p => p.Category).ThenInclude(c => c.ParentCategory)
            .Include(p => p.Reviews)
            .OrderBy(p => Guid.NewGuid())
            .Take(count)
            .ToListAsync();
        var randomResult = randomProducts.Select(p => new
        {
            p.Id,
            StoreName = p.StoreInfo?.StoreName,
            Price = p.ProductVariants.FirstOrDefault()?.Price ?? 0,
            CategoryName = p.Category?.CategoryName,
            CategoryChain = CategoryUtils.GetCategoryChain(p.Category),
            ReviewsCount = p.Reviews.Count
        }).ToList<object>();
        return TypedResult<List<object>>.Success(randomResult);
    }
}
