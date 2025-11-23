using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShahBuyerFeaturesApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveOrderStatusFromOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_Products_ProductId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Favorites_Products_ProductId",
                table: "Favorites");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_ProductDetails_ProductDetailsId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Products_ProductId",
                table: "Reviews");

            migrationBuilder.DropTable(
                name: "ProductDetails");

            migrationBuilder.DropIndex(
                name: "IX_Products_ProductDetailsId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_OrderPayments_BuyerProfileId",
                table: "OrderPayments");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_ProductId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "StoreLogoUrl",
                table: "StoreInfos");

            migrationBuilder.DropColumn(
                name: "ProductDetailsId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ProductId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "OrderPaymentId",
                table: "BuyerProfiles");

            migrationBuilder.RenameColumn(
                name: "ProductId",
                table: "Reviews",
                newName: "ProductVariantId");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_ProductId",
                table: "Reviews",
                newName: "IX_Reviews_ProductVariantId");

            migrationBuilder.RenameColumn(
                name: "ProductId",
                table: "Favorites",
                newName: "ProductVariantId");

            migrationBuilder.RenameIndex(
                name: "IX_Favorites_ProductId",
                table: "Favorites",
                newName: "IX_Favorites_ProductVariantId");

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

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "ProductVariants",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "ProductVariants",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "WeightInGrams",
                table: "ProductVariants",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsMain",
                table: "ProductVariantImages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "OrderItems",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_OrderPayments_BuyerProfileId",
                table: "OrderPayments",
                column: "BuyerProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Favorites_ProductVariants_ProductVariantId",
                table: "Favorites",
                column: "ProductVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_ProductVariants_ProductVariantId",
                table: "Reviews",
                column: "ProductVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Favorites_ProductVariants_ProductVariantId",
                table: "Favorites");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_ProductVariants_ProductVariantId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_OrderPayments_BuyerProfileId",
                table: "OrderPayments");

            migrationBuilder.DropColumn(
                name: "Capacity",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "RegexPattern",
                table: "Taxes");

            migrationBuilder.DropColumn(
                name: "StoreLogo",
                table: "StoreInfos");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "WeightInGrams",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "IsMain",
                table: "ProductVariantImages");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "OrderItems");

            migrationBuilder.RenameColumn(
                name: "ProductVariantId",
                table: "Reviews",
                newName: "ProductId");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_ProductVariantId",
                table: "Reviews",
                newName: "IX_Reviews_ProductId");

            migrationBuilder.RenameColumn(
                name: "ProductVariantId",
                table: "Favorites",
                newName: "ProductId");

            migrationBuilder.RenameIndex(
                name: "IX_Favorites_ProductVariantId",
                table: "Favorites",
                newName: "IX_Favorites_ProductId");

            migrationBuilder.AddColumn<string>(
                name: "StoreLogoUrl",
                table: "StoreInfos",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProductDetailsId",
                table: "Products",
                type: "nvarchar(36)",
                maxLength: 36,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ProductId",
                table: "CartItems",
                type: "nvarchar(36)",
                maxLength: 36,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OrderPaymentId",
                table: "BuyerProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProductDetails",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    HeightInGrams = table.Column<int>(type: "int", nullable: false),
                    LengthInGrams = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    WeightInGrams = table.Column<int>(type: "int", nullable: false),
                    WidthInGrams = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductDetails", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProductDetailsId",
                table: "Products",
                column: "ProductDetailsId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderPayments_BuyerProfileId",
                table: "OrderPayments",
                column: "BuyerProfileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_ProductId",
                table: "CartItems",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_Products_ProductId",
                table: "CartItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Favorites_Products_ProductId",
                table: "Favorites",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_ProductDetails_ProductDetailsId",
                table: "Products",
                column: "ProductDetailsId",
                principalTable: "ProductDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Products_ProductId",
                table: "Reviews",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
