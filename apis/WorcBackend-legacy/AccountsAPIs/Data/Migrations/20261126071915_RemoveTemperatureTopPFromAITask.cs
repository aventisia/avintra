using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTemperatureTopPFromAITask : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Temperature",
                table: "accounts_AITasks");

            migrationBuilder.DropColumn(
                name: "TopP",
                table: "accounts_AITasks");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "Temperature",
                table: "accounts_AITasks",
                type: "real",
                nullable: false,
                defaultValue: 1f);

            migrationBuilder.AddColumn<float>(
                name: "TopP",
                table: "accounts_AITasks",
                type: "real",
                nullable: false,
                defaultValue: 1f);
        }
    }
}
