using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateJobsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Jobs_FlowVersions_FlowVersionId",
                table: "Jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_Jobs_WorkspaceUsers_CreatedByUserId",
                table: "Jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_Jobs_WorkspaceUsers_LastModifiedByUserId",
                table: "Jobs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Jobs",
                table: "Jobs");

            migrationBuilder.DropIndex(
                name: "IX_Jobs_CreatedByUserId",
                table: "Jobs");

            migrationBuilder.DropIndex(
                name: "IX_Jobs_LastModifiedByUserId",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "IsDisabled",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "LastModifiedByUserId",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "LastModifiedOn",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Jobs");

            migrationBuilder.RenameTable(
                name: "Jobs",
                newName: "worc_Jobs");

            migrationBuilder.RenameIndex(
                name: "IX_Jobs_FlowVersionId",
                table: "worc_Jobs",
                newName: "IX_worc_Jobs_FlowVersionId");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "worc_Jobs",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "StartTime",
                table: "worc_Jobs",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<string>(
                name: "InputArguments",
                table: "worc_Jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "MachineId",
                table: "worc_Jobs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OutputArguments",
                table: "worc_Jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "worc_Jobs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "RefId",
                table: "worc_Jobs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TriggerType",
                table: "worc_Jobs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_worc_Jobs",
                table: "worc_Jobs",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_worc_Jobs_MachineId",
                table: "worc_Jobs",
                column: "MachineId");

            migrationBuilder.AddForeignKey(
                name: "FK_worc_Jobs_FlowVersions_FlowVersionId",
                table: "worc_Jobs",
                column: "FlowVersionId",
                principalTable: "FlowVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_worc_Jobs_Machine_MachineId",
                table: "worc_Jobs",
                column: "MachineId",
                principalTable: "Machine",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_worc_Jobs_FlowVersions_FlowVersionId",
                table: "worc_Jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_worc_Jobs_Machine_MachineId",
                table: "worc_Jobs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_worc_Jobs",
                table: "worc_Jobs");

            migrationBuilder.DropIndex(
                name: "IX_worc_Jobs_MachineId",
                table: "worc_Jobs");

            migrationBuilder.DropColumn(
                name: "InputArguments",
                table: "worc_Jobs");

            migrationBuilder.DropColumn(
                name: "MachineId",
                table: "worc_Jobs");

            migrationBuilder.DropColumn(
                name: "OutputArguments",
                table: "worc_Jobs");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "worc_Jobs");

            migrationBuilder.DropColumn(
                name: "RefId",
                table: "worc_Jobs");

            migrationBuilder.DropColumn(
                name: "TriggerType",
                table: "worc_Jobs");

            migrationBuilder.RenameTable(
                name: "worc_Jobs",
                newName: "Jobs");

            migrationBuilder.RenameIndex(
                name: "IX_worc_Jobs_FlowVersionId",
                table: "Jobs",
                newName: "IX_Jobs_FlowVersionId");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Jobs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartTime",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Jobs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "Duration",
                table: "Jobs",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDisabled",
                table: "Jobs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "LastModifiedByUserId",
                table: "Jobs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastModifiedOn",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Jobs",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Jobs",
                table: "Jobs",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_CreatedByUserId",
                table: "Jobs",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_LastModifiedByUserId",
                table: "Jobs",
                column: "LastModifiedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Jobs_FlowVersions_FlowVersionId",
                table: "Jobs",
                column: "FlowVersionId",
                principalTable: "FlowVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Jobs_WorkspaceUsers_CreatedByUserId",
                table: "Jobs",
                column: "CreatedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Jobs_WorkspaceUsers_LastModifiedByUserId",
                table: "Jobs",
                column: "LastModifiedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
