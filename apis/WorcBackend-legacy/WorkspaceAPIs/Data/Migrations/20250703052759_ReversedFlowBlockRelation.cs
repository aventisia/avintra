using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class ReversedFlowBlockRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FlowBlocks_Flows_FlowId",
                table: "FlowBlocks");

            migrationBuilder.DropIndex(
                name: "IX_FlowBlocks_FlowId",
                table: "FlowBlocks");

            migrationBuilder.DropColumn(
                name: "FlowId",
                table: "FlowBlocks");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "FlowBlocks");

            migrationBuilder.AddColumn<Guid>(
                name: "FlowBlockId",
                table: "Flows",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RefId",
                table: "FlowBlocks",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Flows_FlowBlockId",
                table: "Flows",
                column: "FlowBlockId");

            migrationBuilder.AddForeignKey(
                name: "FK_Flows_FlowBlocks_FlowBlockId",
                table: "Flows",
                column: "FlowBlockId",
                principalTable: "FlowBlocks",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Flows_FlowBlocks_FlowBlockId",
                table: "Flows");

            migrationBuilder.DropIndex(
                name: "IX_Flows_FlowBlockId",
                table: "Flows");

            migrationBuilder.DropColumn(
                name: "FlowBlockId",
                table: "Flows");

            migrationBuilder.DropColumn(
                name: "RefId",
                table: "FlowBlocks");

            migrationBuilder.AddColumn<Guid>(
                name: "FlowId",
                table: "FlowBlocks",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "FlowBlocks",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_FlowBlocks_FlowId",
                table: "FlowBlocks",
                column: "FlowId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FlowBlocks_Flows_FlowId",
                table: "FlowBlocks",
                column: "FlowId",
                principalTable: "Flows",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
