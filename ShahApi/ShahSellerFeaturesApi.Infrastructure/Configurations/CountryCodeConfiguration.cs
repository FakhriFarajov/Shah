using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahSellerFeaturesApi.Core.Models;

namespace ShahSellerFeaturesApi.Infrastructure.Configurations
{
    public class CountryCodeConfiguration : IEntityTypeConfiguration<CountryCode>
    {
        public void Configure(EntityTypeBuilder<CountryCode> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
            
            builder.HasMany(x => x.Users)
                   .WithOne(x => x.CountryCitizenship)
                   .HasForeignKey(x => x.CountryCitizenshipId)
                   .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasMany(x => x.Addresses)
                .WithOne(x => x.Country)
                .HasForeignKey(x => x.CountryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}