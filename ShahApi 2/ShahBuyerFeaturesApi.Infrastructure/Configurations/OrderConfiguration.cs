
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahBuyerFeaturesApi.Data.Models;
namespace ShahBuyerFeaturesApi.Infrastructure.Configurations
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.HasKey(o => o.Id);
            builder.Property(o => o.Id).IsRequired().HasMaxLength(36);
            builder.Property(o => o.BuyerProfileId).IsRequired().HasMaxLength(36);
            
            builder.Property(o => o.TotalAmount).IsRequired().HasColumnType("decimal(18, 2)");
            builder.HasOne(o => o.BuyerProfile)
                   .WithMany(bp => bp.Orders)
                   .HasForeignKey(o => o.BuyerProfileId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(o => o.WarehouseOrder)
                   .WithOne(wo => wo.Order)
                   .HasForeignKey<WarehouseOrder>(wo => wo.OrderId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(o => o.OrderItems)
                   .WithOne(oi => oi.Order)
                   .HasForeignKey(oi => oi.OrderId)
                   .OnDelete(DeleteBehavior.Cascade);
            
            
            builder.HasOne(o => o.Receipt)
                .WithOne(wo => wo.Order)
                .HasForeignKey<Order>(wo => wo.ReceiptId)
                .OnDelete(DeleteBehavior.Cascade);
            
        }
    }
}
