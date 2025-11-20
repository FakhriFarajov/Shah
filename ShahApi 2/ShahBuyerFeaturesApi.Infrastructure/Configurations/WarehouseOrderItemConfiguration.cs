using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Infrastructure.Configurations
{
    public class WarehouseOrderItemConfiguration : IEntityTypeConfiguration<WarehouseOrderItem>
    {
        public void Configure(EntityTypeBuilder<WarehouseOrderItem> builder)
        {
            builder.HasKey(woi => woi.Id);
            builder.Property(woi => woi.Id).IsRequired().HasMaxLength(36);
            builder.Property(woi => woi.WarehouseOrderId).IsRequired().HasMaxLength(36);
            builder.Property(woi => woi.OrderItemId).IsRequired().HasMaxLength(36);
            builder.Property(woi => woi.CreatedAt).IsRequired();
        }
    }
}

