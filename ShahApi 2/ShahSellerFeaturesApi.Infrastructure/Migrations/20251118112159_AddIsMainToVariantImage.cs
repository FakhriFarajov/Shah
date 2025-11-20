using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShahSellerFeaturesApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsMainToVariantImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPrice",
                table: "ProductVariants",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountPrice",
                table: "ProductVariants");
        }
    }
}
