using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahSellerAuthApi.Data.Models;

namespace ShahSellerAuthApi.Infrastructure.Configurations
{
    public class ProductConfiguration : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id).IsRequired().HasMaxLength(36);
            builder.Property(p => p.ProductDetailsId).IsRequired().HasMaxLength(36);
            builder.Property(p => p.CategoryId).IsRequired().HasMaxLength(36);
            builder.Property(p => p.StoreInfoId).IsRequired(false).HasMaxLength(36);

            builder.HasOne(p => p.ProductDetails)
                   .WithOne(pd => pd.Product)
                   .HasForeignKey<Product>(p => p.ProductDetailsId)
                   .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(p => p.StoreInfo)
                   .WithMany(si => si.Products)
                   .HasForeignKey(p => p.StoreInfoId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.Category)
                   .WithMany(c => c.Products)
                   .HasForeignKey(p => p.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(p => p.Favorites)
                   .WithOne(f => f.Product)
                   .HasForeignKey(f => f.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(p => p.Reviews)
                   .WithOne(r => r.Product)
                   .HasForeignKey(r => r.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(p => p.ProductVariants)
                   .WithOne(v => v.Product)
                   .HasForeignKey(v => v.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);
            
        }
    }
}
