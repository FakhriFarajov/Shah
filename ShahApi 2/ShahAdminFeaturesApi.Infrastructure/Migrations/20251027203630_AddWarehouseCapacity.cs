using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShahBuyerFeaturesApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWarehouseCapacity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StoreLogoUrl",
                table: "StoreInfos");

            migrationBuilder.AddColumn<int>(
                name: "Capacity",
                table: "Warehouses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RegexPattern",
                table: "Taxes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StoreLogo",
                table: "StoreInfos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Capacity",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "RegexPattern",
                table: "Taxes");

            migrationBuilder.DropColumn(
                name: "StoreLogo",
                table: "StoreInfos");

            migrationBuilder.AddColumn<string>(
                name: "StoreLogoUrl",
                table: "StoreInfos",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);
        }
    }
}
