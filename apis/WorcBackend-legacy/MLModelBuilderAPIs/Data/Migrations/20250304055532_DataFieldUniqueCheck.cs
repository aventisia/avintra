using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Migrations
{
    /// <inheritdoc />
    public partial class DataFieldUniqueCheck : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DataFields_MLModelId",
                table: "DataFields");

            migrationBuilder.CreateIndex(
                name: "IX_MLModels_Name_CreatedByUserId",
                table: "MLModels",
                columns: new[] { "Name", "CreatedByUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DataFields_MLModelId_Name",
                table: "DataFields",
                columns: new[] { "MLModelId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MLModels_Name_CreatedByUserId",
                table: "MLModels");

            migrationBuilder.DropIndex(
                name: "IX_DataFields_MLModelId_Name",
                table: "DataFields");

            migrationBuilder.CreateIndex(
                name: "IX_DataFields_MLModelId",
                table: "DataFields",
                column: "MLModelId");
        }
    }
}
