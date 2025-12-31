using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateExecutionLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FlowExecutionLogs_WorkspaceUsers_CreatedByUserId",
                table: "FlowExecutionLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_FlowExecutionLogs_WorkspaceUsers_LastModifiedByUserId",
                table: "FlowExecutionLogs");

            migrationBuilder.DropIndex(
                name: "IX_FlowExecutionLogs_CreatedByUserId",
                table: "FlowExecutionLogs");

            migrationBuilder.DropIndex(
                name: "IX_FlowExecutionLogs_LastModifiedByUserId",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "ActionName",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "InputData",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "IsDisabled",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "LastModifiedByUserId",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "OutputData",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "FlowExecutionLogs");

            migrationBuilder.RenameColumn(
                name: "LastModifiedOn",
                table: "FlowExecutionLogs",
                newName: "ExecutedOn");

            migrationBuilder.AddColumn<string>(
                name: "ExecutedBy",
                table: "FlowExecutionLogs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExecutionType",
                table: "FlowExecutionLogs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ActionExecutionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionName = table.Column<string>(type: "text", nullable: false),
                    InputData = table.Column<string>(type: "text", nullable: false),
                    OutputData = table.Column<string>(type: "text", nullable: false),
                    ExecutionType = table.Column<int>(type: "integer", nullable: false),
                    ExecutedBy = table.Column<string>(type: "text", nullable: true),
                    ExecutedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FlowExecutionLogId = table.Column<Guid>(type: "uuid", nullable: false)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActionExecutionLogs");

            migrationBuilder.DropColumn(
                name: "ExecutedBy",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "ExecutionType",
                table: "FlowExecutionLogs");

            migrationBuilder.RenameColumn(
                name: "ExecutedOn",
                table: "FlowExecutionLogs",
                newName: "LastModifiedOn");

            migrationBuilder.AddColumn<string>(
                name: "ActionName",
                table: "FlowExecutionLogs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "FlowExecutionLogs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedOn",
                table: "FlowExecutionLogs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<string>(
                name: "InputData",
                table: "FlowExecutionLogs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDisabled",
                table: "FlowExecutionLogs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "LastModifiedByUserId",
                table: "FlowExecutionLogs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "OutputData",
                table: "FlowExecutionLogs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "FlowExecutionLogs",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.CreateIndex(
                name: "IX_FlowExecutionLogs_CreatedByUserId",
                table: "FlowExecutionLogs",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FlowExecutionLogs_LastModifiedByUserId",
                table: "FlowExecutionLogs",
                column: "LastModifiedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_FlowExecutionLogs_WorkspaceUsers_CreatedByUserId",
                table: "FlowExecutionLogs",
                column: "CreatedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FlowExecutionLogs_WorkspaceUsers_LastModifiedByUserId",
                table: "FlowExecutionLogs",
                column: "LastModifiedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
