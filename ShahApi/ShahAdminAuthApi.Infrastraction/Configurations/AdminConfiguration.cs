using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAdminAuthApi.Core.Models;

namespace ShahAdminAuthApi.Infrastraction.Configurations
{
    public class AdminConfiguration : IEntityTypeConfiguration<Admin>
    {
        public void Configure(EntityTypeBuilder<Admin> builder)
        {
            builder.ToTable("Admins");
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id).IsRequired().HasMaxLength(36).HasColumnType("nvarchar(36)");
            builder.Property(a => a.Name).IsRequired().HasMaxLength(100);
            builder.Property(a => a.Email).IsRequired().HasMaxLength(100);
            builder.Property(a => a.Password).IsRequired().HasMaxLength(255);
            builder.Property(a => a.Role).IsRequired().HasMaxLength(50);
            builder.Property(a => a.CreatedAt).IsRequired();
        }
    }
}

