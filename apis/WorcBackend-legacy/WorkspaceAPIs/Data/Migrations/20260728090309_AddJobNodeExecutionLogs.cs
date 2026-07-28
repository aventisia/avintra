using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddJobNodeExecutionLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "NodeExecutionLogs",
                table: "ws_Jobs",
                newName: "NodeExecutionLogsLegacy");

            migrationBuilder.AlterColumn<int>(
                name: "CreditsConsumed",
                table: "ws_Jobs",
                type: "integer",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "double precision",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "ws_JobNodeExecutionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    NodeExecutionId = table.Column<string>(type: "text", nullable: false),
                    RetryAttempt = table.Column<int>(type: "integer", nullable: false),
                    NodeId = table.Column<string>(type: "text", nullable: false),
                    NodeDisplayName = table.Column<string>(type: "text", nullable: false),
                    NodeUniqueName = table.Column<string>(type: "text", nullable: false),
                    IsSuccess = table.Column<bool>(type: "boolean", nullable: false),
                    Duration = table.Column<double>(type: "double precision", nullable: false),
                    InputsJsonCompressed = table.Column<byte[]>(type: "bytea", nullable: true),
                    OutputsJsonCompressed = table.Column<byte[]>(type: "bytea", nullable: true),
                    InputsJsonLength = table.Column<int>(type: "integer", nullable: true),
                    OutputsJsonLength = table.Column<int>(type: "integer", nullable: true),
                    ExecutedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ws_JobNodeExecutionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ws_JobNodeExecutionLogs_ws_Jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "ws_Jobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ws_JobNodeExecutionLogs_JobId",
                table: "ws_JobNodeExecutionLogs",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_ws_JobNodeExecutionLogs_TenantId_JobId_NodeId_NodeExecution~",
                table: "ws_JobNodeExecutionLogs",
                columns: new[] { "TenantId", "JobId", "NodeId", "NodeExecutionId", "RetryAttempt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ws_JobNodeExecutionLogs");

            migrationBuilder.RenameColumn(
                name: "NodeExecutionLogsLegacy",
                table: "ws_Jobs",
                newName: "NodeExecutionLogs");

            migrationBuilder.AlterColumn<double>(
                name: "CreditsConsumed",
                table: "ws_Jobs",
                type: "double precision",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
