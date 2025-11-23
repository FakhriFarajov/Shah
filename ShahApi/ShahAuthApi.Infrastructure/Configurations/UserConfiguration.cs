using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahAuthApi.Core.Models;

namespace ShahAuthApi.Infrastructure.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).IsRequired().HasMaxLength(36);
            builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Surname).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Email).IsRequired().HasMaxLength(150);
            builder.Property(x => x.Phone).IsRequired().HasMaxLength(15);
            builder.Property(x => x.Password).IsRequired().HasMaxLength(100);
            builder.Property(x => x.CountryCitizenshipId).IsRequired();
            builder.HasOne(x => x.CountryCitizenship)
                   .WithMany(x => x.Users)
                   .HasForeignKey(x => x.CountryCitizenshipId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
