using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ShahSellerAuthApi.Infrastraction.Configurations
{
    public class ProductAttributeConfiguration : IEntityTypeConfiguration<ProductAttribute>
    {
        public void Configure(EntityTypeBuilder<ProductAttribute> builder)
        {
            builder.HasKey(pa => pa.Id);
            builder.Property(pa => pa.Id).IsRequired().HasMaxLength(36);
            builder.Property(pa => pa.CategoryId).IsRequired().HasMaxLength(36);

            builder.HasOne(pa => pa.Category)
                   .WithMany(c => c.ProductAttributes)
                   .HasForeignKey(pa => pa.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(pa => pa.AttributeValues)
                   .WithOne(v => v.ProductAttribute)
                   .HasForeignKey(v => v.ProductAttributeId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
