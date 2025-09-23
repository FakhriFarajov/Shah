using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahBuyerAuthApi.Data.Models;
namespace ShahBuyerAuthApi.Infrastructure.Configurations
{
    public class StoreInfoConfiguration : IEntityTypeConfiguration<StoreInfo>
    {
        public void Configure(EntityTypeBuilder<StoreInfo> builder)
        {
            builder.HasKey(si => si.Id);
            builder.Property(si => si.Id).IsRequired().HasMaxLength(36);
            builder.Property(si => si.AddressId).HasMaxLength(36);
            builder.Property(si => si.CategoryId).IsRequired().HasMaxLength(36);

            builder.HasOne(si => si.Address)
                   .WithOne(a => a.StoreInfo)
                   .HasForeignKey<StoreInfo>(si => si.AddressId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(si => si.SellerProfile)
                   .WithOne(sp => sp.StoreInfo)
                   .HasForeignKey<StoreInfo>(si => si.Id)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(si => si.Category)
                   .WithMany(c => c.StoreInfos)
                   .HasForeignKey(si => si.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(si => si.Products)
                   .WithOne(p => p.StoreInfo)
                   .HasForeignKey(p => p.StoreInfoId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
