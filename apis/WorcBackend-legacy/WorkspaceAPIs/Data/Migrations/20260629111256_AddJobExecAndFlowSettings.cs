using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddJobExecAndFlowSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExecutedBy",
                table: "worc_Jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<JsonDocument>(
                name: "Settings",
                table: "FlowVersions",
                type: "jsonb",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_worc_ResourceShares_ResourceId_UserId",
                table: "worc_ResourceShares",
                columns: new[] { "ResourceId", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_worc_ResourceShares_ResourceId_UserId",
                table: "worc_ResourceShares");

            migrationBuilder.DropColumn(
                name: "ExecutedBy",
                table: "worc_Jobs");

            migrationBuilder.DropColumn(
                name: "Settings",
                table: "FlowVersions");
        }
    }
}
