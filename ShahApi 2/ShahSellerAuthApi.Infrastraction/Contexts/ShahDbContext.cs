using System.Reflection;
using Microsoft.EntityFrameworkCore;
using ShahSellerAuthApi.Data.Models;


namespace ShahSellerAuthApi.Infrastructure.Contexts;

public class ShahDbContext : DbContext
{
    public DbSet<Address> Addresses { get; set; }
    public DbSet<ProductAttribute> ProductAttributes { get; set; }
    public DbSet<ProductAttributeValue> ProductAttributeValues { get; set; }
    public DbSet<BuyerProfile> BuyerProfiles { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Favorite> Favorites { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<OrderPayment> OrderPayments { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductDetails> ProductDetails { get; set; }
    public DbSet<ProductVariant> ProductVariants { get; set; }
    public DbSet<ProductVariantAttributeValue> ProductVariantAttributeValues { get; set; }
    public DbSet<ProductVariantImage> ProductVariantImages { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<SellerProfile> SellerProfiles { get; set; }
    public DbSet<SellerTaxInfo> SellerTaxInfos { get; set; }
    public DbSet<StoreInfo> StoreInfos { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Warehouse> Warehouses { get; set; }
    public DbSet<WarehouseOrder> WarehouseOrders { get; set; }
    public DbSet<Receipt> Receipts { get; set; }
    
    public ShahDbContext(DbContextOptions<ShahDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

    }
}
