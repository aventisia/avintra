using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameJobInputArgumentJsonToInputArgumentsJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InputArgumentJson",
                table: "worc_Jobs",
                newName: "InputArgumentsJson");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InputArgumentsJson",
                table: "worc_Jobs",
                newName: "InputArgumentJson");
        }
    }
}
