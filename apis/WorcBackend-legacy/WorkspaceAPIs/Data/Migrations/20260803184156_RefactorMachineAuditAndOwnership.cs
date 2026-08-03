using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RefactorMachineAuditAndOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Machines_WorkspaceUsers_CreatedByUserId",
                table: "Machines");

            migrationBuilder.DropForeignKey(
                name: "FK_Machines_WorkspaceUsers_LastModifiedByUserId",
                table: "Machines");

            migrationBuilder.DropIndex(
                name: "IX_Machines_CreatedByUserId",
                table: "Machines");

            migrationBuilder.DropIndex(
                name: "IX_Machines_LastModifiedByUserId",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "LastModifiedByUserId",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "LastModifiedOn",
                table: "Machines");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Machines",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE \"Machines\" SET \"UserId\" = \"CreatedByUserId\" WHERE \"UserId\" IS NULL");

            migrationBuilder.Sql(
                "ALTER TABLE \"Machines\" ALTER COLUMN \"UserId\" SET NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Machines_UserId",
                table: "Machines",
                column: "UserId");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Machines");

            migrationBuilder.RenameColumn(
                name: "CreatedOn",
                table: "Machines",
                newName: "CreatedAt");

            migrationBuilder.DropColumn(
                name: "Environment",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "Machines");

            migrationBuilder.AddForeignKey(
                name: "FK_Machines_WorkspaceUsers_UserId",
                table: "Machines",
                column: "UserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Machines_WorkspaceUsers_UserId",
                table: "Machines");

            migrationBuilder.DropIndex(
                name: "IX_Machines_UserId",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Machines");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Machines",
                newName: "CreatedOn");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Machines",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "LastModifiedByUserId",
                table: "Machines",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastModifiedOn",
                table: "Machines",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<string>(
                name: "Environment",
                table: "Machines",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "Machines",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Machines_CreatedByUserId",
                table: "Machines",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Machines_LastModifiedByUserId",
                table: "Machines",
                column: "LastModifiedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Machines_WorkspaceUsers_CreatedByUserId",
                table: "Machines",
                column: "CreatedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Machines_WorkspaceUsers_LastModifiedByUserId",
                table: "Machines",
                column: "LastModifiedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
