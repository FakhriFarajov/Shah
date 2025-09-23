using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahBuyerAuthApi.Data.Models;
namespace ShahBuyerAuthApi.Infrastructure.Configurations
{
    public class BuyerProfileConfiguration : IEntityTypeConfiguration<BuyerProfile>
    {
        public void Configure(EntityTypeBuilder<BuyerProfile> builder)
        {
            builder.HasKey(bp => bp.UserId);
            builder.Property(bp => bp.UserId).IsRequired().HasMaxLength(36);
            builder.Property(bp => bp.AddressId)
                .HasMaxLength(36)
                .HasColumnType("nvarchar(36)");

            builder.HasOne(bp => bp.User)
                   .WithOne(u => u.BuyerProfile)
                   .HasForeignKey<BuyerProfile>(bp => bp.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Change relationship to one-to-one
            builder.HasOne(bp => bp.Address)
                   .WithOne(a => a.BuyerProfile)
                   .HasForeignKey<BuyerProfile>(bp => bp.AddressId)
                   .OnDelete(DeleteBehavior.SetNull);
            
            builder.HasMany(bp => bp.Favorites)
                   .WithOne(f => f.BuyerProfile)
                   .HasForeignKey(f => f.BuyerProfileId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(bp => bp.Orders)
                   .WithOne(o => o.BuyerProfile)
                   .HasForeignKey(o => o.BuyerProfileId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(bp => bp.Reviews)
                   .WithOne(r => r.BuyerProfile)
                   .HasForeignKey(r => r.BuyerProfileId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(bp => bp.CartItems)
                   .WithOne(ci => ci.BuyerProfile)
                   .HasForeignKey(ci => ci.BuyerProfileId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(bp => bp.OrderPayment)
                   .WithOne(p => p.BuyerProfile)
                   .HasForeignKey<OrderPayment>(p => p.BuyerProfileId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
