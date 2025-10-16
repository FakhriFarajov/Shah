
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAdminAuthApi.Core.Models;

namespace ShahAdminAuthApi.Infrastructure.Configurations
{
    public class FavoriteConfiguration : IEntityTypeConfiguration<Favorite>
    {
        public void Configure(EntityTypeBuilder<Favorite> builder)
        {
            builder.HasKey(f => f.Id);
            builder.Property(f => f.Id).IsRequired().HasMaxLength(36);
            builder.Property(f => f.BuyerProfileId).IsRequired().HasMaxLength(36);
            builder.Property(f => f.ProductId).IsRequired().HasMaxLength(36);

            builder.HasOne(f => f.BuyerProfile)
                   .WithMany(bp => bp.Favorites)
                   .HasForeignKey(f => f.BuyerProfileId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(f => f.Product)
                   .WithMany(p => p.Favorites)
                   .HasForeignKey(f => f.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
