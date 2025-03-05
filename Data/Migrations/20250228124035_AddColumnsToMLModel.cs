using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Migrations
{
    /// <inheritdoc />
    public partial class AddColumnsToMLModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Accuracy",
                table: "MLModels",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DocsProcessed",
                table: "MLModels",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Accuracy",
                table: "MLModels");

            migrationBuilder.DropColumn(
                name: "DocsProcessed",
                table: "MLModels");
        }
    }
}
