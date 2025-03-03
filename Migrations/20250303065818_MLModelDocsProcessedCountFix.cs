using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Migrations
{
    /// <inheritdoc />
    public partial class MLModelDocsProcessedCountFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocsProcessed",
                table: "MLModels");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DocsProcessed",
                table: "MLModels",
                type: "integer",
                nullable: true);
        }
    }
}
