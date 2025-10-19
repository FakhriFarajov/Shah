using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAuthApi.Core.Models;

namespace ShahAuthApi.Infrastructure.Configurations
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
                   .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ci => ci.ProductVariant)
                   .WithMany(p => p.CartItems)
                   .HasForeignKey(ci => ci.ProductVariantId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
