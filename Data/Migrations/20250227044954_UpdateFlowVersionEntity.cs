using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFlowVersionEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReactFlowObject",
                table: "Flows");

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "FlowVersions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ReactFlowObject",
                table: "FlowVersions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "FlowVersions");

            migrationBuilder.DropColumn(
                name: "ReactFlowObject",
                table: "FlowVersions");

            migrationBuilder.AddColumn<string>(
                name: "ReactFlowObject",
                table: "Flows",
                type: "text",
                nullable: true);
        }
    }
}
