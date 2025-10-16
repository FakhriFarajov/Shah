using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahBuyerAuthApi.Core.Models;

namespace ShahBuyerAuthApi.Infrastructure.Configurations
{
    public class AddressConfiguration : IEntityTypeConfiguration<Address>
    {
        public void Configure(EntityTypeBuilder<Address> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).IsRequired().HasMaxLength(36);
            builder.Property(x => x.Street).IsRequired().HasMaxLength(250);
            builder.Property(x => x.City).IsRequired().HasMaxLength(100);
            builder.Property(x => x.State).HasMaxLength(100);
            builder.Property(x => x.PostalCode).IsRequired().HasMaxLength(20);
            builder.Property(x => x.CountryId).IsRequired();
            builder.HasOne(x => x.Country)
                    .WithMany(x => x.Addresses)
                   .HasForeignKey(x => x.CountryId)
                   .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.BuyerProfile)
                   .WithOne(x => x.Address)
                        .HasForeignKey<Address>(x => x.BuyerProfileId)
                   .OnDelete(DeleteBehavior.SetNull);
            builder.HasOne(x => x.StoreInfo)
                   .WithOne(x => x.Address)
                     .HasForeignKey<Address>(x => x.StoreInfoId)
                   .OnDelete(DeleteBehavior.SetNull);
            builder.HasOne(x => x.Warehouse)
                   .WithOne(x => x.Address)
                        .HasForeignKey<Address>(x => x.WarehouseId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
