using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahSellerFeaturesApi.Core.Models;

namespace ShahSellerFeaturesApi.Infrastructure.Configurations
{
    public class FavoriteConfiguration : IEntityTypeConfiguration<Favorite>
    {
        public void Configure(EntityTypeBuilder<Favorite> builder)
        {
            builder.HasKey(f => f.Id);
            builder.Property(f => f.Id).IsRequired().HasMaxLength(36);
            builder.Property(f => f.BuyerProfileId).IsRequired().HasMaxLength(36);
            builder.Property(f => f.ProductVariantId).IsRequired().HasMaxLength(36);

            builder.HasOne(f => f.BuyerProfile)
                   .WithMany(bp => bp.Favorites)
                   .HasForeignKey(f => f.BuyerProfileId)
                   .OnDelete(DeleteBehavior.Cascade);

                   builder.HasOne(f => f.ProductVariant)
                   .WithMany(p => p.Favorites)
                   .HasForeignKey(f => f.ProductVariantId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
