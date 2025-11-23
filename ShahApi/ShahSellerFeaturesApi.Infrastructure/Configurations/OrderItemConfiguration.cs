using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahSellerFeaturesApi.Core.Models;
using ShahSellerFeaturesApi.Core.Enums;

namespace ShahSellerFeaturesApi.Infrastructure.Configurations
{
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.HasKey(oi => oi.Id);
            builder.Property(oi => oi.Id).IsRequired().HasMaxLength(36);
            builder.Property(oi => oi.OrderId).IsRequired().HasMaxLength(36);
            builder.Property(oi => oi.ProductVariantId).IsRequired().HasMaxLength(36);

            builder.HasOne(oi => oi.Order)
                   .WithMany(o => o.OrderItems)
                   .HasForeignKey(oi => oi.OrderId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(oi => oi.ProductVariant)
                   .WithMany(pv => pv.OrderItems)
                   .HasForeignKey(oi => oi.ProductVariantId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(oi => oi.Status)
                   .HasConversion<int>()
                   .HasDefaultValue(OrderStatus.Pending);
        }
    }
}
