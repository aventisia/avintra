using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddQuantityAndTypeToBillingHistories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "BillingHistories",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "BillingHistories",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "BillingHistories");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "BillingHistories");
        }
    }
}
