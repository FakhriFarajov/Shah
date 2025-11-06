using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAdminFeaturesApi.Core.Models;

namespace ShahAdminFeaturesApi.Infrastructure.Configurations
{
    public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
    {
        public void Configure(EntityTypeBuilder<ProductVariant> builder)
        {
            builder.HasKey(pv => pv.Id);
            builder.Property(pv => pv.Id).IsRequired().HasMaxLength(36);
            builder.Property(pv => pv.ProductId).IsRequired().HasMaxLength(36);
            builder.Property(pv => pv.Stock).IsRequired();
            builder.Property(pv => pv.Price).IsRequired().HasColumnType("decimal(18,2)");

            builder.HasOne(pv => pv.Product)
                   .WithMany(p => p.ProductVariants)
                   .HasForeignKey(pv => pv.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(pv => pv.Images)
                   .WithOne(img => img.ProductVariant)
                   .HasForeignKey(img => img.ProductVariantId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(pv => pv.ProductVariantAttributeValues)
                   .WithOne(pvav => pvav.ProductVariant)
                   .HasForeignKey(pvav => pvav.ProductVariantId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(pv => pv.OrderItems)
                   .WithOne(oi => oi.ProductVariant)
                   .HasForeignKey(oi => oi.ProductVariantId)
                   .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasMany(pv => pv.CartItems)
                   .WithOne(ci => ci.ProductVariant)
                   .HasForeignKey(ci => ci.ProductVariantId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
