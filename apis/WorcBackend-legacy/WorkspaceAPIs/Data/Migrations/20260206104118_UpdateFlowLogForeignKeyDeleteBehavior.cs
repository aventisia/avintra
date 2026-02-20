using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFlowLogForeignKeyDeleteBehavior : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FlowLog_Flows_FlowId",
                table: "FlowLog");

            migrationBuilder.AddForeignKey(
                name: "FK_FlowLog_Flows_FlowId",
                table: "FlowLog",
                column: "FlowId",
                principalTable: "Flows",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FlowLog_Flows_FlowId",
                table: "FlowLog");

            migrationBuilder.AddForeignKey(
                name: "FK_FlowLog_Flows_FlowId",
                table: "FlowLog",
                column: "FlowId",
                principalTable: "Flows",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
