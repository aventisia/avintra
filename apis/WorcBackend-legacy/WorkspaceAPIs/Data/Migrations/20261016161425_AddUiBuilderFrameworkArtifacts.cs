using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUiBuilderFrameworkArtifacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContentFormat",
                table: "UiBuilderVersions",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "html");

            migrationBuilder.AddColumn<string>(
                name: "SourceArtifact",
                table: "UiBuilderVersions",
                type: "text",
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE \"UiBuilderVersions\" SET \"ContentFormat\" = 'html' WHERE \"ContentFormat\" IS NULL OR \"ContentFormat\" = '';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContentFormat",
                table: "UiBuilderVersions");

            migrationBuilder.DropColumn(
                name: "SourceArtifact",
                table: "UiBuilderVersions");
        }
    }
}
