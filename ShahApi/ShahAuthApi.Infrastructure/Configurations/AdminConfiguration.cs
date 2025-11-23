using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAuthApi.Core.Models;

namespace ShahAuthApi.Infrastructure.Configurations
{
    public class AdminConfiguration : IEntityTypeConfiguration<AdminProfile>
    {
        public void Configure(EntityTypeBuilder<AdminProfile> builder)
        {
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id).IsRequired().HasMaxLength(36).HasColumnType("nvarchar(36)");
            builder.Property(a => a.UserId).HasMaxLength(36).HasColumnType("nvarchar(36)").IsRequired(false);
            
            builder.HasOne(a => a.User)
                   .WithOne(u => u.AdminProfile)
                   .HasForeignKey<AdminProfile>(a => a.UserId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}