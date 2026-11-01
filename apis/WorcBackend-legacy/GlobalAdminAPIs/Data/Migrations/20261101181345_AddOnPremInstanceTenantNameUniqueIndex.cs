using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GlobalAdminAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOnPremInstanceTenantNameUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ga_OnPremInstances_OnPremTenantId_Name",
                table: "ga_OnPremInstances",
                columns: new[] { "OnPremTenantId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ga_OnPremInstances_OnPremTenantId_Name",
                table: "ga_OnPremInstances");
        }
    }
}
