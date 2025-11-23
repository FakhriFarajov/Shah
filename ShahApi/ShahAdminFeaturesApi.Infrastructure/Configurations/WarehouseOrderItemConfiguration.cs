using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAdminFeaturesApi.Core.Models;

namespace ShahAdminFeaturesApi.Infrastructure.Configurations;

public class WarehouseOrderItemConfiguration : IEntityTypeConfiguration<WarehouseOrderItem>
{
    public void Configure(EntityTypeBuilder<WarehouseOrderItem> builder)
    {
        builder.HasKey(wi => wi.Id);
        builder.Property(wi => wi.Id).HasMaxLength(36);
        builder.Property(wi => wi.WarehouseOrderId).IsRequired();
        builder.Property(wi => wi.OrderItemId).IsRequired();
        builder.HasIndex(wi => new { wi.WarehouseOrderId, wi.OrderItemId }).IsUnique();

        // Only these two relationships should exist
        builder.HasOne(wi => wi.WarehouseOrder)
            .WithMany(wo => wo.WarehouseOrderItems)
            .HasForeignKey(wi => wi.WarehouseOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(wi => wi.OrderItem)
            .WithMany(oi => oi.WarehouseOrderItems)
            .HasForeignKey(wi => wi.OrderItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
