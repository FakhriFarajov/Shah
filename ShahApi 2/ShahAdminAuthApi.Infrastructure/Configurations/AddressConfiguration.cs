using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAdminAuthApi.Core.Models;

namespace ShahAdminAuthApi.Infrastructure.Configurations
{
       public class AddressConfiguration : IEntityTypeConfiguration<Address>
       {
              public void Configure(EntityTypeBuilder<Address> builder)
              {
                     // Primary key
                     builder.HasKey(a => a.Id);
                     builder.Property(a => a.Id)
                            .IsRequired()
                            .HasMaxLength(36);

                     // Common address fields
                     builder.Property(a => a.Street)
                            .IsRequired()
                            .HasMaxLength(250);

                     builder.Property(a => a.City)
                            .IsRequired()
                            .HasMaxLength(100);

                     // State can be optional depending on country
                     builder.Property(a => a.State)
                            .IsRequired(false)
                            .HasMaxLength(100);

                     builder.Property(a => a.PostalCode)
                            .IsRequired()
                            .HasMaxLength(20);

                     builder.Property(a => a.Country)
                            .IsRequired()
                            .HasMaxLength(100);

                     // Relationships
                     builder.HasOne(a => a.BuyerProfile)
                            .WithOne(bp => bp.Address)
                            .HasForeignKey<Address>(a => a.BuyerProfileId)
                            .OnDelete(DeleteBehavior.SetNull);

                     // Fix: Warehouse relationship should be one-to-one
                     builder.HasOne(a => a.Warehouse)
                            .WithOne(w => w.Address)
                            .HasForeignKey<Warehouse>(w => w.AddressId)
                            .OnDelete(DeleteBehavior.SetNull);

                     builder.HasOne(a => a.StoreInfo)
                            .WithOne(si => si.Address)
                            .HasForeignKey<Address>(a => a.StoreInfoId)
                            .OnDelete(DeleteBehavior.Cascade);
                            
              }
       }
}
