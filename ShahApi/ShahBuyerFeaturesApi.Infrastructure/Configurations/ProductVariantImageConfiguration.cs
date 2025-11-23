using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Infrastructure.Configurations
{
    public class ProductVariantImageConfiguration : IEntityTypeConfiguration<ProductVariantImage>
    {
        public void Configure(EntityTypeBuilder<ProductVariantImage> builder)
        {
            builder.HasKey(pvi => pvi.Id);
            builder.Property(pvi => pvi.Id).IsRequired().HasMaxLength(36);
            builder.Property(pvi => pvi.ProductVariantId).IsRequired().HasMaxLength(36);

            builder.HasOne(pvi => pvi.ProductVariant)
                   .WithMany(pv => pv.Images)
                   .HasForeignKey(pvi => pvi.ProductVariantId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
