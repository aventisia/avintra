using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFlowExecutionLogEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "EndTime",
                table: "FlowExecutionLogs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<Guid>(
                name: "FlowVersionId",
                table: "FlowExecutionLogs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "FlowExecutionLogs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RetryCount",
                table: "FlowExecutionLogs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "StartTime",
                table: "FlowExecutionLogs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "FlowExecutionLogs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_FlowExecutionLogs_FlowVersionId",
                table: "FlowExecutionLogs",
                column: "FlowVersionId");

            migrationBuilder.AddForeignKey(
                name: "FK_FlowExecutionLogs_FlowVersions_FlowVersionId",
                table: "FlowExecutionLogs",
                column: "FlowVersionId",
                principalTable: "FlowVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FlowExecutionLogs_FlowVersions_FlowVersionId",
                table: "FlowExecutionLogs");

            migrationBuilder.DropIndex(
                name: "IX_FlowExecutionLogs_FlowVersionId",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "FlowVersionId",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "RetryCount",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "FlowExecutionLogs");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "FlowExecutionLogs");
        }
    }
}
