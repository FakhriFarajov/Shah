using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAdminFeaturesApi.Core.Models;

namespace ShahAdminFeaturesApi.Infrastructure.Configurations
{
    
    public class SellerTaxInfoConfiguration : IEntityTypeConfiguration<SellerTaxInfo>
    {
        public void Configure(EntityTypeBuilder<SellerTaxInfo> builder)
        {
            builder.HasKey(st => st.Id);
            builder.Property(st => st.Id).IsRequired().HasMaxLength(36);

            builder.HasOne(st => st.SellerProfile)
                   .WithOne(sp => sp.SellerTaxInfo)
                   .HasForeignKey<SellerTaxInfo>(st => st.SellerProfileId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
