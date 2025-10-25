using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAdminFeaturesApi.Core.Models;

namespace ShahAdminFeaturesApi.Infrastructure.Configurations
{
    public class SellerProfileConfiguration : IEntityTypeConfiguration<SellerProfile>
    {
        public void Configure(EntityTypeBuilder<SellerProfile> builder)
        {
            builder.HasKey(sp => sp.Id);
            builder.Property(sp => sp.UserId).IsRequired();
            builder.Property(sp => sp.StoreInfoId);
            builder.Property(sp => sp.Passport).IsRequired().HasMaxLength(36);
            builder.Property(sp => sp.SellerTaxInfoId).HasMaxLength(36);
            builder.Property(sp => sp.IsVerified).IsRequired().HasDefaultValue(false);
            builder.Property(sp => sp.Id).IsRequired().HasMaxLength(36).HasColumnType("nvarchar(36)");

            builder.HasOne(sp => sp.User)
                   .WithOne(u => u.SellerProfile)
                   .HasForeignKey<SellerProfile>(sp => sp.Id)
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
