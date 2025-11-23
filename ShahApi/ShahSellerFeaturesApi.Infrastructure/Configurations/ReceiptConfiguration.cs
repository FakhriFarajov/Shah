using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShahSellerFeaturesApi.Core.Models;

namespace ShahSellerFeaturesApi.Infrastructure.Configurations
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
            
            // Relationship configured from OrderConfiguration (Order.ReceiptId FK)
        }
    }
}
