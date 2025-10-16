using ShahAdminFeaturesApi.Application.Services.Interfaces;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class CartService : ICartService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;

    public CartService(ShahDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    
    public async Task AddToCart(string buyerId, string productId, string productVariantId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null)
            throw new Exception("Product not found");
        var variant = await _context.ProductVariants.FindAsync(productVariantId);
        if (variant == null || variant.ProductId != productId)
            throw new Exception("Product variant not found");
        var cartItem = await _context.CartItems.FirstOrDefaultAsync(ci => ci.BuyerProfileId == buyerId && ci.ProductId == productId && ci.ProductVariantId == productVariantId);
        int newQuantity = cartItem != null ? cartItem.Quantity + 1 : 1;
        if (variant.Stock < newQuantity)
            throw new Exception("Not enough stock available");
        if (cartItem != null)
        {
            cartItem.Quantity += 1;
        }
        else
        {
            cartItem = new CartItem
            {
                BuyerProfileId = buyerId,
                ProductId = productId,
                ProductVariantId = productVariantId,
                Quantity = 1
            };
            _context.CartItems.Add(cartItem);
        }
        await _context.SaveChangesAsync();
    }

    public async Task DeleteFromCart(string buyerId, string productId, string productVariantId)
    {
        var cartItem = await _context.CartItems.FirstOrDefaultAsync(ci => ci.BuyerProfileId == buyerId && ci.ProductId == productId && ci.ProductVariantId == productVariantId);
        if (cartItem == null)
            throw new Exception("Cart item not found");
        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();
    }

    public async Task IncreaseQuantity(string buyerId, string productId, string productVariantId)
    {
        var cartItem = await _context.CartItems.FirstOrDefaultAsync(ci => ci.BuyerProfileId == buyerId && ci.ProductId == productId && ci.ProductVariantId == productVariantId);
        if (cartItem == null)
            throw new Exception("Cart item not found");
        var variant = await _context.ProductVariants.FindAsync(productVariantId);
        if (variant == null || variant.ProductId != productId)
            throw new Exception("Product variant not found");
        if (cartItem.Quantity + 1 > variant.Stock)
            throw new Exception("Not enough stock available");
        cartItem.Quantity += 1;
        await _context.SaveChangesAsync();
    }

    public async Task DecreaseQuantity(string buyerId, string productId, string productVariantId)
    {
        var cartItem = await _context.CartItems.FirstOrDefaultAsync(ci => ci.BuyerProfileId == buyerId && ci.ProductId == productId && ci.ProductVariantId == productVariantId);
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
        _context.CartItems.RemoveRange(allItems);
        await _context.SaveChangesAsync();
    }

    public async Task<TypedResult<object>> GetAllCartItems(string buyerId)
    {
        var cartItems = await _context.CartItems
            .Include(ci => ci.Product)
                .ThenInclude(p => p.ProductDetails)
            .Include(ci => ci.ProductVariant)
                .ThenInclude(v => v.ProductVariantAttributeValue)
                    .ThenInclude(vav => vav.ProductAttributeValue)
                        .ThenInclude(av => av.ProductAttribute)
            .Where(ci => ci.BuyerProfileId == buyerId)
            .Select(ci => new
            {
                ci.Id,
                Product = new
                {
                    ci.Product.Id,
                    ProductDetails = ci.Product.ProductDetails == null ? null : new
                    {
                        ci.Product.ProductDetails.Id,
                        ci.Product.ProductDetails.Title,
                        ci.Product.ProductDetails.Description,
                    }
                },
                ProductVariant = new
                {
                    ci.ProductVariant.Id,
                    ci.ProductVariant.Price,
                    ci.ProductVariant.Stock,
                    Attributes = ci.ProductVariant.ProductVariantAttributeValue.Select(vav => new
                    {
                        Name = vav.ProductAttributeValue.ProductAttribute.Name,
                        Value = vav.ProductAttributeValue.Value
                    }).ToList()
                },
                ci.Quantity
            })
            .ToListAsync();

        return TypedResult<object>.Success(cartItems);
    }
    


}
