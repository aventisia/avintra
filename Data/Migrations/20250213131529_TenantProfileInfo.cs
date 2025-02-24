using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Migrations
{
    /// <inheritdoc />
    public partial class TenantProfileInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "BillingAccounts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "BillingAccounts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StateOrProvince",
                table: "BillingAccounts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ZipOrPostalCode",
                table: "BillingAccounts",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "BillingAccounts");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "BillingAccounts");

            migrationBuilder.DropColumn(
                name: "StateOrProvince",
                table: "BillingAccounts");

            migrationBuilder.DropColumn(
                name: "ZipOrPostalCode",
                table: "BillingAccounts");
        }
    }
}
