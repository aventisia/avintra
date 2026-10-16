using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUiBuilderPublishedVersionPin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PublishedVersionNumber",
                table: "UiBuilderProjects",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE "UiBuilderProjects" AS project
                SET "PublishedVersionNumber" = (
                    SELECT MAX(version."VersionNumber")
                    FROM "UiBuilderVersions" AS version
                    WHERE version."UiBuilderProjectId" = project."Id"
                )
                WHERE project."IsPublished" = TRUE;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublishedVersionNumber",
                table: "UiBuilderProjects");
        }
    }
}
