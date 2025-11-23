using Microsoft.EntityFrameworkCore.Migrations;

namespace ShahBuyerFeaturesApi.Infrastructure.Migrations
{
    public partial class ForceDropOrderPaymentsBuyerProfileIdIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"IF EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_OrderPayments_BuyerProfileId' AND object_id = OBJECT_ID('OrderPayments'))
                DROP INDEX IX_OrderPayments_BuyerProfileId ON OrderPayments;");
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

