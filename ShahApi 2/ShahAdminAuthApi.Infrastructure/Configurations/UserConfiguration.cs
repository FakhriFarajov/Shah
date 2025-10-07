using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahBuyerAuthApi.Core.Models;

namespace ShahBuyerAuthApi.Infrastructure.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Id).IsRequired().HasMaxLength(36);

            builder.Property(u => u.Name).HasMaxLength(100).IsRequired();
            builder.Property(u => u.Surname).HasMaxLength(100).IsRequired();
            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(255);
            builder.HasIndex(u => u.Email)
                .IsUnique();
            builder.Property(u => u.Password).HasMaxLength(255).IsRequired();
            builder.Property(u => u.Phone).HasMaxLength(20).IsRequired();
            builder.Property(u => u.EmailConfirmed);
                
            
            

            builder.HasOne(u => u.BuyerProfile)
                   .WithOne(bp => bp.User)
                   .HasForeignKey<BuyerProfile>(bp => bp.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // One User <-> One SellerProfile (shared PK on SellerProfile.UserId)
            builder.HasOne(u => u.SellerProfile)
                   .WithOne(sp => sp.User)
                   .HasForeignKey<SellerProfile>(sp => sp.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
