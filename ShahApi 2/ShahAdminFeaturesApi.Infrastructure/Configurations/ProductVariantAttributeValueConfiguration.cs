using ShahAdminFeaturesApi.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ShahAdminFeaturesApi.Infrastructure.Configurations
{
    public class ProductVariantAttributeValueConfiguration : IEntityTypeConfiguration<ProductVariantAttributeValue>
    {
        public void Configure(EntityTypeBuilder<ProductVariantAttributeValue> builder)
        {
            builder.HasKey(pvav => pvav.Id);
            builder.Property(pvav => pvav.Id).IsRequired().HasMaxLength(36);
            builder.Property(pvav => pvav.ProductVariantId).IsRequired().HasMaxLength(36);
            builder.Property(pvav => pvav.ProductAttributeValueId).IsRequired().HasMaxLength(36);

            builder.HasOne(pvav => pvav.ProductVariant)
                   .WithMany(pv => pv.ProductVariantAttributeValues)
                   .HasForeignKey(pvav => pvav.ProductVariantId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(pvav => pvav.ProductAttributeValue)
                   .WithMany(av => av.ProductVariantValues)
                   .HasForeignKey(pvav => pvav.ProductAttributeValueId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
