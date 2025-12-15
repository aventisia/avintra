using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveActionFlowLogsAndRenameJobExecutionLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActionExecutionLogs");

            migrationBuilder.DropTable(
                name: "Blocks");

            migrationBuilder.DropTable(
                name: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "ExecutionLogs",
                table: "worc_Jobs");

            migrationBuilder.RenameColumn(
                name: "OutputArguments",
                table: "worc_Jobs",
                newName: "NodeExecutionLogs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "NodeExecutionLogs",
                table: "worc_Jobs",
                newName: "OutputArguments");

            migrationBuilder.AddColumn<string>(
                name: "ExecutionLogs",
                table: "worc_Jobs",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Blocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    FlowVariablesObject = table.Column<string>(type: "text", nullable: true),
                    InputOutputObject = table.Column<string>(type: "text", nullable: true),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ReactFlowObject = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Blocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Blocks_FlowVersions_FlowVersionId",
                        column: x => x.FlowVersionId,
                        principalTable: "FlowVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Blocks_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Blocks_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FlowExecutionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Duration = table.Column<double>(type: "double precision", nullable: true),
                    EndTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    ExecutedBy = table.Column<string>(type: "text", nullable: true),
                    ExecutedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ExecutionType = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    RetryCount = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlowExecutionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FlowExecutionLogs_FlowVersions_FlowVersionId",
                        column: x => x.FlowVersionId,
                        principalTable: "FlowVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FlowExecutionLogs_Flows_FlowId",
                        column: x => x.FlowId,
                        principalTable: "Flows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ActionExecutionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowExecutionLogId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionName = table.Column<string>(type: "text", nullable: false),
                    ExecutedBy = table.Column<string>(type: "text", nullable: true),
                    ExecutedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ExecutionType = table.Column<int>(type: "integer", nullable: false),
                    InputData = table.Column<string>(type: "text", nullable: false),
                    OutputData = table.Column<string>(type: "text", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActionExecutionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActionExecutionLogs_FlowExecutionLogs_FlowExecutionLogId",
                        column: x => x.FlowExecutionLogId,
                        principalTable: "FlowExecutionLogs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActionExecutionLogs_FlowExecutionLogId",
                table: "ActionExecutionLogs",
                column: "FlowExecutionLogId");

            migrationBuilder.CreateIndex(
                name: "IX_Blocks_CreatedByUserId",
                table: "Blocks",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Blocks_FlowVersionId",
                table: "Blocks",
                column: "FlowVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_Blocks_LastModifiedByUserId",
                table: "Blocks",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FlowExecutionLogs_FlowId",
                table: "FlowExecutionLogs",
                column: "FlowId");

            migrationBuilder.CreateIndex(
                name: "IX_FlowExecutionLogs_FlowVersionId",
                table: "FlowExecutionLogs",
                column: "FlowVersionId");
        }
    }
}
