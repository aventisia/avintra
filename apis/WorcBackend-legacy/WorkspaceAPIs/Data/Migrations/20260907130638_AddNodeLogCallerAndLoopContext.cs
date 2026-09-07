using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNodeLogCallerAndLoopContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CallerReferenceId",
                table: "ws_JobNodeExecutionLogs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "LoopIterationIndex",
                table: "ws_JobNodeExecutionLogs",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<string>(
                name: "LoopReferenceId",
                table: "ws_JobNodeExecutionLogs",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CallerReferenceId",
                table: "ws_JobNodeExecutionLogs");

            migrationBuilder.DropColumn(
                name: "LoopIterationIndex",
                table: "ws_JobNodeExecutionLogs");

            migrationBuilder.DropColumn(
                name: "LoopReferenceId",
                table: "ws_JobNodeExecutionLogs");
        }
    }
}
