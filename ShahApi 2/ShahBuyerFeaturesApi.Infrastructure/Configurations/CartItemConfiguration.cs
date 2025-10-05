
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahBuyerFeaturesApi.Core.Models;
namespace ShahBuyerFeaturesApi.Infrastructure.Configurations
{
    public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
    {
        public void Configure(EntityTypeBuilder<CartItem> builder)
        {
            builder.HasKey(ci => ci.Id);
            builder.Property(ci => ci.Id).IsRequired().HasMaxLength(36);
            builder.Property(ci => ci.BuyerProfileId).IsRequired().HasMaxLength(36);
            builder.Property(ci => ci.ProductId).IsRequired().HasMaxLength(36);

            builder.HasOne(ci => ci.BuyerProfile)
                   .WithMany(bp => bp.CartItems)
                   .HasForeignKey(ci => ci.BuyerProfileId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ci => ci.Product)
                   .WithMany(p => p.CartItems)
                   .HasForeignKey(ci => ci.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
