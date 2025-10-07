
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahBuyerAuthApi.Core.Models;
namespace ShahBuyerAuthApi.Infrastructure.Configurations
{
    public class SellerProfileConfiguration : IEntityTypeConfiguration<SellerProfile>
    {
        public void Configure(EntityTypeBuilder<SellerProfile> builder)
        {
            builder.HasKey(sp => sp.UserId);
            builder.Property(sp => sp.UserId).IsRequired().HasMaxLength(36);
            builder.Property(sp => sp.StoreInfoId).IsRequired().HasMaxLength(36);
            builder.Property(sp => sp.SellerTaxInfoId).IsRequired().HasMaxLength(36);
            builder.Property(sp => sp.Passport).IsRequired().HasMaxLength(36);
            builder.Property(sp => sp.IsVerified).IsRequired().HasDefaultValue(false);
            
            builder.HasOne(sp => sp.User)
                   .WithOne(u => u.SellerProfile)
                   .HasForeignKey<SellerProfile>(sp => sp.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(sp => sp.StoreInfo)
                   .WithOne(si => si.SellerProfile)
                   .HasForeignKey<SellerProfile>(sp => sp.StoreInfoId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(sp => sp.SellerTaxInfo)
                   .WithOne(st => st.SellerProfile)
                   .HasForeignKey<SellerProfile>(sp => sp.SellerTaxInfoId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
