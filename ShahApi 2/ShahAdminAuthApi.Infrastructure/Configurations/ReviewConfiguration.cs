using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAdminAuthApi.Core.Models;

namespace ShahAdminAuthApi.Infrastructure.Configurations
{
    public class ReviewConfiguration : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> builder)
        {
            builder.HasKey(r => r.Id);
            builder.Property(r => r.Id).IsRequired().HasMaxLength(36);
            builder.Property(r => r.BuyerProfileId).IsRequired().HasMaxLength(36);
            builder.Property(r => r.ProductId).IsRequired().HasMaxLength(36);

            builder.HasOne(r => r.BuyerProfile)
                   .WithMany(bp => bp.Reviews)
                   .HasForeignKey(r => r.BuyerProfileId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Product)
                   .WithMany(p => p.Reviews)
                   .HasForeignKey(r => r.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
