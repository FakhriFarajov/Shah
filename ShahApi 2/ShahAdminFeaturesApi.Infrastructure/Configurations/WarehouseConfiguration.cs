using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAdminFeaturesApi.Core.Models;

namespace ShahAdminFeaturesApi.Infrastructure.Configurations
{
    public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
    {
        public void Configure(EntityTypeBuilder<Warehouse> builder)
        {
            builder.HasKey(w => w.Id);
            builder.Property(w => w.Id).IsRequired().HasMaxLength(36);
            builder.Property(w => w.AddressId).HasMaxLength(36);
            builder.Property(w => w.Capacity).IsRequired();
            
            builder.HasOne(w => w.Address)
                   .WithOne(a => a.Warehouse)
                   .HasForeignKey<Warehouse>(w => w.AddressId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(w => w.WarehouseOrder)
                   .WithOne(wo => wo.Warehouse)
                   .HasForeignKey(wo => wo.WarehouseId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
