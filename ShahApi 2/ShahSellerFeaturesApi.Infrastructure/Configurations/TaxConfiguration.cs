using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahSellerFeaturesApi.Core.Models;

namespace ShahSellerFeaturesApi.Infrastructure.Configurations
{
    public class TaxConfiguration : IEntityTypeConfiguration<Tax>
    {
        public void Configure(EntityTypeBuilder<Tax> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).IsRequired().HasMaxLength(50);
            
            builder.HasMany(x => x.SellerTaxInfos)
                   .WithOne(x => x.Tax)
                   .HasForeignKey(x => x.TaxId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

