using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFlowVersionUserEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_worc_FlowVersionUsers_WorkspaceUsers_CreatedByUserId",
                table: "worc_FlowVersionUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_worc_FlowVersionUsers_WorkspaceUsers_LastModifiedByUserId",
                table: "worc_FlowVersionUsers");

            migrationBuilder.DropIndex(
                name: "IX_worc_FlowVersionUsers_CreatedByUserId",
                table: "worc_FlowVersionUsers");

            migrationBuilder.DropIndex(
                name: "IX_worc_FlowVersionUsers_LastModifiedByUserId",
                table: "worc_FlowVersionUsers");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "worc_FlowVersionUsers");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "worc_FlowVersionUsers");

            migrationBuilder.DropColumn(
                name: "IsDisabled",
                table: "worc_FlowVersionUsers");

            migrationBuilder.DropColumn(
                name: "LastModifiedByUserId",
                table: "worc_FlowVersionUsers");

            migrationBuilder.DropColumn(
                name: "LastModifiedOn",
                table: "worc_FlowVersionUsers");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "worc_FlowVersionUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "worc_FlowVersionUsers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedOn",
                table: "worc_FlowVersionUsers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<bool>(
                name: "IsDisabled",
                table: "worc_FlowVersionUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "LastModifiedByUserId",
                table: "worc_FlowVersionUsers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastModifiedOn",
                table: "worc_FlowVersionUsers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "worc_FlowVersionUsers",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.CreateIndex(
                name: "IX_worc_FlowVersionUsers_CreatedByUserId",
                table: "worc_FlowVersionUsers",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_FlowVersionUsers_LastModifiedByUserId",
                table: "worc_FlowVersionUsers",
                column: "LastModifiedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_worc_FlowVersionUsers_WorkspaceUsers_CreatedByUserId",
                table: "worc_FlowVersionUsers",
                column: "CreatedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_worc_FlowVersionUsers_WorkspaceUsers_LastModifiedByUserId",
                table: "worc_FlowVersionUsers",
                column: "LastModifiedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
