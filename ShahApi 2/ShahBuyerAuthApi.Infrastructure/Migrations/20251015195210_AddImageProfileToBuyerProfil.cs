using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShahBuyerAuthApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImageProfileToBuyerProfil : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "CountryCodes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Code",
                table: "CountryCodes");
        }
    }
}
