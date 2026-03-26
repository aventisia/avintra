using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWebhookTrigger_RenameInputArgs_AddOutputDataJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InputArguments",
                table: "worc_Jobs",
                newName: "InputArgumentJson");

            migrationBuilder.AddColumn<string>(
                name: "OutputDataJson",
                table: "worc_Jobs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OutputDataJson",
                table: "worc_Jobs");

            migrationBuilder.RenameColumn(
                name: "InputArgumentJson",
                table: "worc_Jobs",
                newName: "InputArguments");
        }
    }
}
