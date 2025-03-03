using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIsArchivedField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "FlowVersions",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "FlowVersions");
        }
    }
}
