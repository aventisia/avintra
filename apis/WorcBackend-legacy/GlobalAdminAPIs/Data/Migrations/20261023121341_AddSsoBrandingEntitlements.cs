using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GlobalAdminAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSsoBrandingEntitlements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsBrandingAllowed",
                table: "ga_OnPremTenants",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSsoAllowed",
                table: "ga_OnPremTenants",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsBrandingAllowed",
                table: "ga_OnPremTenants");

            migrationBuilder.DropColumn(
                name: "IsSsoAllowed",
                table: "ga_OnPremTenants");
        }
    }
}
