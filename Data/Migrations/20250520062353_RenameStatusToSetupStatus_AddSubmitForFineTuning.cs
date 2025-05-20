using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameStatusToSetupStatus_AddSubmitForFineTuning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Status",
                table: "MLModels",
                newName: "SetupStatus");

            migrationBuilder.AddColumn<bool>(
                name: "SubmitForFineTuning",
                table: "ExtractedData",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubmitForFineTuning",
                table: "ExtractedData");

            migrationBuilder.RenameColumn(
                name: "SetupStatus",
                table: "MLModels",
                newName: "Status");
        }
    }
}
