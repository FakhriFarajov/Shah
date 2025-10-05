using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahBuyerFeaturesApi.Core.Models;
namespace ShahBuyerFeaturesApi.Infrastructure.Configurations
{
    public class OrderPaymentConfiguration : IEntityTypeConfiguration<OrderPayment>
    {
        public void Configure(EntityTypeBuilder<OrderPayment> builder)
        {
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id).IsRequired().HasMaxLength(36);
            builder.Property(p => p.BuyerProfileId).IsRequired().HasMaxLength(36);
            builder.Property(p => p.TotalAmount).HasColumnType("decimal(18,2)");
            builder.Property(p => p.RefundAmount).HasColumnType("decimal(18,2)");
            
            // 🔹 One Order → One Payment
            builder.HasMany(p => p.Orders)
                .WithOne(o => o.OrderPayment)
                .OnDelete(DeleteBehavior.Restrict); // prevent multiple cascade paths

            // 🔹 One BuyerProfile → One Payment
            builder.HasOne(p => p.BuyerProfile)
                .WithOne(bp => bp.OrderPayment)
                .HasForeignKey<OrderPayment>(p => p.BuyerProfileId)
                .OnDelete(DeleteBehavior.Cascade); // keep cascade here
        }
    }
}
