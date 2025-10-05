
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Infrastructure.Configurations
{
    public class WarehouseOrderConfiguration : IEntityTypeConfiguration<WarehouseOrder>
    {
        public void Configure(EntityTypeBuilder<WarehouseOrder> builder)
        {
            builder.HasKey(wo => wo.Id);
            builder.Property(wo => wo.Id).IsRequired().HasMaxLength(36);
            builder.Property(wo => wo.OrderId).IsRequired().HasMaxLength(36);
            builder.Property(wo => wo.WarehouseId).IsRequired().HasMaxLength(36);

            builder.HasOne(wo => wo.Order)
                   .WithOne(o => o.WarehouseOrder)
                   .HasForeignKey<WarehouseOrder>(wo => wo.OrderId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(wo => wo.Warehouse)
                   .WithMany(w => w.WarehouseOrder)
                   .HasForeignKey(wo => wo.WarehouseId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
