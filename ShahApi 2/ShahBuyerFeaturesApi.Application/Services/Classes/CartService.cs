using Microsoft.EntityFrameworkCore;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Core.Models;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;

namespace ShahBuyerFeaturesApi.Application.Services.Classes;

public class CartService : ICartService
{
    private readonly ShahDbContext _context;

    public CartService(ShahDbContext context)
    {
        _context = context;
    }
    
    public async Task AddToCart(string productVariantId, string buyerId)
    {
        // Validate variant exists
        var variant = await _context.ProductVariants.FindAsync(productVariantId);
        if (variant == null)
            throw new Exception("Product variant not found");

        // Find existing cart item for this buyer + variant
        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.BuyerProfileId == buyerId && ci.ProductVariantId == productVariantId);

        int newQuantity = cartItem != null ? cartItem.Quantity + 1 : 1;
        if (variant.Stock < newQuantity)
            throw new Exception("Not enough stock available");

        if (cartItem != null)
        {
            cartItem.Quantity = newQuantity;
        }
        else
        {
            cartItem = new CartItem
            {
                BuyerProfileId = buyerId,
                ProductVariantId = productVariantId,
                Quantity = 1
            };
            _context.CartItems.Add(cartItem);
        }
        await _context.SaveChangesAsync();
    }

    public async Task DeleteFromCart(string productVariantId, string buyerId)
    {
        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.BuyerProfileId == buyerId && ci.ProductVariantId == productVariantId);
        if (cartItem == null)
            throw new Exception("Cart item not found");
        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();
    }

    public async Task IncreaseQuantity(string productVariantId, string buyerId)
    {
        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.BuyerProfileId == buyerId && ci.ProductVariantId == productVariantId);
        if (cartItem == null)
            throw new Exception("Cart item not found");

        var variant = await _context.ProductVariants.FindAsync(productVariantId);
        if (variant == null)
            throw new Exception("Product variant not found");

        if (cartItem.Quantity + 1 > variant.Stock)
            throw new Exception("Not enough stock available");

        cartItem.Quantity += 1;
        await _context.SaveChangesAsync();
    }

    public async Task DecreaseQuantity(string productVariantId, string buyerId)
    {
        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.BuyerProfileId == buyerId && ci.ProductVariantId == productVariantId);
        if (cartItem == null)
            throw new Exception("Cart item not found");

        cartItem.Quantity -= 1;
        if (cartItem.Quantity <= 0)
        {
            _context.CartItems.Remove(cartItem);
        }
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAllCartItems(string buyerId)
    {
        var allItems = await _context.CartItems.Where(c => c.BuyerProfileId == buyerId).ToListAsync();
        if (allItems.Count > 0)
        {
            _context.CartItems.RemoveRange(allItems);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<TypedResult<object>> GetAllCartItems(string buyerId)
    {
        var cartItems = await _context.CartItems
            .Include(ci => ci.ProductVariant)
            .ThenInclude(pv => pv.Product)
            .ThenInclude(p => p.StoreInfo)
            .Include(ci => ci.ProductVariant)
            .ThenInclude(pv => pv.Product)
            .ThenInclude(p => p.Category)
            .Include(ci => ci.ProductVariant)
            .ThenInclude(pv => pv.ProductVariantAttributeValues)
            .ThenInclude(vav => vav.ProductAttributeValue)
            .ThenInclude(pav => pav.ProductAttribute)
            .Include(ci => ci.ProductVariant)
            .ThenInclude(pv => pv.Images)
            .Include(ci => ci.ProductVariant)
            .ThenInclude(pv => pv.Reviews)
            .Where(ci => ci.BuyerProfileId == buyerId)
            .Select(ci => new CartListItemDto
            {
                Id = ci.Id,
                Product = ci.ProductVariant != null && ci.ProductVariant.Product != null ? new ProductDto
                {
                    Id = ci.ProductVariant.Product.Id,
                    StoreName = ci.ProductVariant.Product.StoreInfo.StoreName,
                    CategoryName = ci.ProductVariant.Product.Category.CategoryName
                } : null,
                ProductVariant = ci.ProductVariant != null ? new ProductVariantDto
                {
                    Id = ci.ProductVariant.Id,
                    Title = ci.ProductVariant.Title,
                    Description = ci.ProductVariant.Description,
                    Price = ci.ProductVariant.Price,
                    DiscountPrice = (ci.ProductVariant.DiscountPrice > 0 && ci.ProductVariant.DiscountPrice < ci.ProductVariant.Price) ? ci.ProductVariant.DiscountPrice : ci.ProductVariant.Price,
                    Stock = ci.ProductVariant.Stock,
                    Attributes = ci.ProductVariant.ProductVariantAttributeValues.Select(vav => new AttributeDto
                    {
                        Name = vav.ProductAttributeValue.ProductAttribute.Name,
                        Value = vav.ProductAttributeValue.Value
                    }).ToList(),
                    Images = ci.ProductVariant.Images.Select(i => new ImageDto { ImageUrl = i.ImageUrl, IsMain = i.IsMain }).ToList(),
                    ReviewsCount = ci.ProductVariant.Reviews.Count(),
                    AverageRating = ci.ProductVariant.Reviews.Any() ? ci.ProductVariant.Reviews.Average(r => r.Rating) : 0.0
                } : null,
                Quantity = ci.Quantity
            })
            .ToListAsync();

        return TypedResult<object>.Success(cartItems.Cast<object>().ToList());
    }

    // DTOs used for projection (EF Core can materialize these as long as they have settable properties)
    private class CartListItemDto
    {
        public string Id { get; set; } = null!;
        public ProductDto? Product { get; set; }
        public ProductVariantDto ProductVariant { get; set; } = null!;
        public int Quantity { get; set; }
    }

    private class ProductDto
    {
        public string? Id { get; set; }
        public string? StoreName { get; set; }
        public string? CategoryName { get; set; }
    }

    private class ProductVariantDto
    {
        public string Id { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; }
        public decimal DiscountPrice { get; set; }
        public int Stock { get; set; }
        public List<AttributeDto> Attributes { get; set; } = new();
        public List<ImageDto> Images { get; set; } = new();
        public int ReviewsCount { get; set; }
        public double AverageRating { get; set; }
    }

    private class AttributeDto
    {
        public string Name { get; set; } = null!;
        public string Value { get; set; } = null!;
    }

    private class ImageDto
    {
        public string ImageUrl { get; set; } = null!;
        public bool IsMain { get; set; }
    }

}
