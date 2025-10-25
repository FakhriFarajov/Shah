using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAdminFeaturesApi.Core.Models;

namespace ShahAdminFeaturesApi.Infrastructure.Configurations
{
    public class ProductDetailsConfiguration : IEntityTypeConfiguration<ProductDetails>
    {
        public void Configure(EntityTypeBuilder<ProductDetails> builder)
        {
            builder.HasKey(pd => pd.Id);
            builder.Property(pd => pd.Id).IsRequired().HasMaxLength(36);
            builder.Property(pd => pd.Title).HasMaxLength(255);
            builder.Property(pd => pd.Description).HasMaxLength(4000);
            builder.Property(pd => pd.WeightInGrams).IsRequired();
            builder.Property(pd => pd.ProductId).IsRequired().HasMaxLength(36);
            
            builder.HasOne(p => p.Product).
                WithOne(pd => pd.ProductDetails)
                .HasForeignKey<Product>(p => p.ProductDetailsId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
