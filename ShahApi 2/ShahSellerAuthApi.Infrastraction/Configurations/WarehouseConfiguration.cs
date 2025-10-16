using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ShahSellerAuthApi.Infrastraction.Configurations;

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.Property(x => x.Id).IsRequired().HasMaxLength(36);
        builder.Property(x => x.AddressId).HasMaxLength(36);
        builder.HasOne(x => x.Address)
            .WithOne(x => x.Warehouse)
            .HasForeignKey<Warehouse>(x => x.AddressId)
            .OnDelete(DeleteBehavior.SetNull);

    }
}