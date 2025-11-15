using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Infrastructure.Configurations
{
    public class ReceiptConfiguration : IEntityTypeConfiguration<Receipt>
    {
        public void Configure(EntityTypeBuilder<Receipt> builder)
        {
            builder.HasKey(r => r.Id);

            builder.Property(r => r.Amount)
                .IsRequired().HasColumnType("decimal(18,2)");

            builder.Property(r => r.IssuedAt)
                .IsRequired();

            builder.Property(r => r.File)
                .IsRequired();
        }
    }
}
