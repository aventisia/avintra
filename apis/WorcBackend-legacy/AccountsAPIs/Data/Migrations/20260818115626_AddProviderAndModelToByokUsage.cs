using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProviderAndModelToByokUsage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "ByokUsages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Provider",
                table: "ByokUsages",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Model",
                table: "ByokUsages");

            migrationBuilder.DropColumn(
                name: "Provider",
                table: "ByokUsages");
        }
    }
}
