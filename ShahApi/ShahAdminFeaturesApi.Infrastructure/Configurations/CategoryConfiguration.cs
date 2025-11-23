using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAdminFeaturesApi.Core.Models;

namespace ShahAdminFeaturesApi.Infrastructure.Configurations
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Id).IsRequired().HasMaxLength(36);
            builder.Property(c => c.CategoryName).HasMaxLength(150);

            builder.HasOne(c => c.ParentCategory)
                   .WithMany(pc => pc.SubCategories)
                   .HasForeignKey(c => c.ParentCategoryId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(c => c.Products)
                   .WithOne(p => p.Category)
                   .HasForeignKey(p => p.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(c => c.ProductAttributes)
                   .WithOne(pa => pa.Category)
                   .HasForeignKey(pa => pa.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(c => c.StoreInfos)
                   .WithOne(si => si.Category)
                   .HasForeignKey(si => si.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
