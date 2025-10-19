using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahSellerFeaturesApi.Core.Models;

namespace ShahSellerFeaturesApi.Infrastructure.Configurations
{
    public class ProductAttributeValueConfiguration : IEntityTypeConfiguration<ProductAttributeValue>
    {
        public void Configure(EntityTypeBuilder<ProductAttributeValue> builder)
        {
            builder.HasKey(av => av.Id);
            builder.Property(av => av.Id).IsRequired().HasMaxLength(36);
            builder.Property(av => av.ProductAttributeId).IsRequired().HasMaxLength(36);

            builder.HasOne(av => av.ProductAttribute)
                   .WithMany(pa => pa.AttributeValues)
                   .HasForeignKey(av => av.ProductAttributeId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(av => av.ProductVariantValues)
                   .WithOne(pvav => pvav.ProductAttributeValue)
                   .HasForeignKey(pvav => pvav.ProductAttributeValueId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
