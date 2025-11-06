using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAuthApi.Core.Models;

namespace ShahAuthApi.Infrastructure.Configurations;

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.Property(x => x.Id).IsRequired().HasMaxLength(36);
        builder.Property(x => x.AddressId).HasMaxLength(36);
        builder.Property(x => x.Capacity).IsRequired();
        builder.HasOne(x => x.Address)
            .WithOne(x => x.Warehouse)
            .HasForeignKey<Warehouse>(x => x.AddressId)
            .OnDelete(DeleteBehavior.SetNull);
        
        
        builder.HasMany(w => w.WarehouseOrder)
            .WithOne(wo => wo.Warehouse)
            .HasForeignKey(wo => wo.WarehouseId)
            .OnDelete(DeleteBehavior.Cascade);

    }
}