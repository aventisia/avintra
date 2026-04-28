using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFlowVersionHistoryIdToJobs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FlowVersionHistoryId",
                table: "worc_Jobs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_worc_Jobs_FlowVersionHistoryId",
                table: "worc_Jobs",
                column: "FlowVersionHistoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_worc_Jobs_worc_FlowVersionHistory_FlowVersionHistoryId",
                table: "worc_Jobs",
                column: "FlowVersionHistoryId",
                principalTable: "worc_FlowVersionHistory",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_worc_Jobs_worc_FlowVersionHistory_FlowVersionHistoryId",
                table: "worc_Jobs");

            migrationBuilder.DropIndex(
                name: "IX_worc_Jobs_FlowVersionHistoryId",
                table: "worc_Jobs");

            migrationBuilder.DropColumn(
                name: "FlowVersionHistoryId",
                table: "worc_Jobs");
        }
    }
}
