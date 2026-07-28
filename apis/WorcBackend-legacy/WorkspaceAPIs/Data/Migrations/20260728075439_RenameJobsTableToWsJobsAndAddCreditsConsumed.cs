using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameJobsTableToWsJobsAndAddCreditsConsumed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_worc_Jobs_FlowVersions_FlowVersionId",
                table: "worc_Jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_worc_Jobs_Machines_MachineId",
                table: "worc_Jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_worc_Jobs_worc_FlowVersionHistory_FlowVersionHistoryId",
                table: "worc_Jobs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_worc_Jobs",
                table: "worc_Jobs");

            migrationBuilder.RenameTable(
                name: "worc_Jobs",
                newName: "ws_Jobs");

            migrationBuilder.RenameIndex(
                name: "IX_worc_Jobs_MachineId",
                table: "ws_Jobs",
                newName: "IX_ws_Jobs_MachineId");

            migrationBuilder.RenameIndex(
                name: "IX_worc_Jobs_FlowVersionId",
                table: "ws_Jobs",
                newName: "IX_ws_Jobs_FlowVersionId");

            migrationBuilder.RenameIndex(
                name: "IX_worc_Jobs_FlowVersionHistoryId",
                table: "ws_Jobs",
                newName: "IX_ws_Jobs_FlowVersionHistoryId");

            migrationBuilder.AddColumn<double>(
                name: "CreditsConsumed",
                table: "ws_Jobs",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ws_Jobs",
                table: "ws_Jobs",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ws_Jobs_FlowVersions_FlowVersionId",
                table: "ws_Jobs",
                column: "FlowVersionId",
                principalTable: "FlowVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ws_Jobs_Machines_MachineId",
                table: "ws_Jobs",
                column: "MachineId",
                principalTable: "Machines",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ws_Jobs_worc_FlowVersionHistory_FlowVersionHistoryId",
                table: "ws_Jobs",
                column: "FlowVersionHistoryId",
                principalTable: "worc_FlowVersionHistory",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ws_Jobs_FlowVersions_FlowVersionId",
                table: "ws_Jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_ws_Jobs_Machines_MachineId",
                table: "ws_Jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_ws_Jobs_worc_FlowVersionHistory_FlowVersionHistoryId",
                table: "ws_Jobs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ws_Jobs",
                table: "ws_Jobs");

            migrationBuilder.DropColumn(
                name: "CreditsConsumed",
                table: "ws_Jobs");

            migrationBuilder.RenameTable(
                name: "ws_Jobs",
                newName: "worc_Jobs");

            migrationBuilder.RenameIndex(
                name: "IX_ws_Jobs_MachineId",
                table: "worc_Jobs",
                newName: "IX_worc_Jobs_MachineId");

            migrationBuilder.RenameIndex(
                name: "IX_ws_Jobs_FlowVersionId",
                table: "worc_Jobs",
                newName: "IX_worc_Jobs_FlowVersionId");

            migrationBuilder.RenameIndex(
                name: "IX_ws_Jobs_FlowVersionHistoryId",
                table: "worc_Jobs",
                newName: "IX_worc_Jobs_FlowVersionHistoryId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_worc_Jobs",
                table: "worc_Jobs",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_worc_Jobs_FlowVersions_FlowVersionId",
                table: "worc_Jobs",
                column: "FlowVersionId",
                principalTable: "FlowVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_worc_Jobs_Machines_MachineId",
                table: "worc_Jobs",
                column: "MachineId",
                principalTable: "Machines",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_worc_Jobs_worc_FlowVersionHistory_FlowVersionHistoryId",
                table: "worc_Jobs",
                column: "FlowVersionHistoryId",
                principalTable: "worc_FlowVersionHistory",
                principalColumn: "Id");
        }
    }
}
