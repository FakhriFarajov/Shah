using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAdminFeaturesApi.Core.Models;

namespace ShahAdminFeaturesApi.Infrastructure.Configurations
{
    public class StoreInfoConfiguration : IEntityTypeConfiguration<StoreInfo>
    {
        public void Configure(EntityTypeBuilder<StoreInfo> builder)
        {
            builder.HasKey(si => si.Id);
            builder.Property(si => si.Id).IsRequired().HasMaxLength(36).HasColumnType("nvarchar(36)");
            builder.Property(si => si.StoreName).IsRequired().HasMaxLength(100);
            builder.Property(si => si.StoreDescription).IsRequired().HasMaxLength(500);
            builder.Property(si => si.StoreLogo).HasMaxLength(200);
            builder.Property(si => si.StoreEmail).IsRequired().HasMaxLength(100);
            builder.Property(si => si.StorePhone).IsRequired().HasMaxLength(15);
            builder.Property(si => si.SellerProfileId).IsRequired().HasMaxLength(36);
            builder.Property(si => si.AddressId).HasMaxLength(36);
            builder.Property(si => si.CategoryId).HasMaxLength(36);

            builder.HasOne(si => si.Address)
                   .WithOne(a => a.StoreInfo)
                   .HasForeignKey<StoreInfo>(si => si.AddressId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(si => si.SellerProfile)
                   .WithOne(sp => sp.StoreInfo)
                   .HasForeignKey<StoreInfo>(si => si.SellerProfileId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(si => si.Category)
                   .WithMany(c => c.StoreInfos)
                   .HasForeignKey(si => si.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .IsRequired(false); // Make CategoryId optional

            builder.HasMany(si => si.Products)
                   .WithOne(p => p.StoreInfo)
                   .HasForeignKey(p => p.StoreInfoId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
