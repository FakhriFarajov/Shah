using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShahSellerFeaturesApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsMainToVariantImage_20251104 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsMain",
                table: "ProductVariantImages",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsMain",
                table: "ProductVariantImages");
        }
    }
}
