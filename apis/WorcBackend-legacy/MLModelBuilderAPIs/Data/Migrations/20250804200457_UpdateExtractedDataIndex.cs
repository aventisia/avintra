using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateExtractedDataIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ExtractedData_ModelTaskId",
                table: "ExtractedData");

            migrationBuilder.CreateIndex(
                name: "IX_ExtractedData_ModelTaskId",
                table: "ExtractedData",
                column: "ModelTaskId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ExtractedData_ModelTaskId",
                table: "ExtractedData");

            migrationBuilder.CreateIndex(
                name: "IX_ExtractedData_ModelTaskId",
                table: "ExtractedData",
                column: "ModelTaskId",
                unique: true);
        }
    }
}
