using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAuthApi.Core.Models;

namespace ShahAuthApi.Infrastructure.Configurations
{
    public class AdminProfileConfiguration : IEntityTypeConfiguration<AdminProfile>
    {
        public void Configure(EntityTypeBuilder<AdminProfile> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).IsRequired().HasMaxLength(36);
            builder.Property(x => x.UserId).HasMaxLength(36);
            builder.HasOne(x => x.User)
                   .WithOne(x => x.AdminProfile)
                   .HasForeignKey<AdminProfile>(x => x.UserId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}

