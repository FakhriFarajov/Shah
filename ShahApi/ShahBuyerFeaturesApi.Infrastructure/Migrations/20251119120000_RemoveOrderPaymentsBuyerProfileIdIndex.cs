using Microsoft.EntityFrameworkCore.Migrations;

namespace ShahBuyerFeaturesApi.Infrastructure.Migrations
{
    public partial class RemoveOrderPaymentsBuyerProfileIdIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OrderPayments_BuyerProfileId",
                table: "OrderPayments");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_OrderPayments_BuyerProfileId",
                table: "OrderPayments",
                column: "BuyerProfileId",
                unique: true);
        }
    }
}

