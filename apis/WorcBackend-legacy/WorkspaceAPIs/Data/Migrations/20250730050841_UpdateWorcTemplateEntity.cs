using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWorcTemplateEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorcTemplates_FlowVersions_FlowVersionId",
                table: "WorcTemplates");

            migrationBuilder.DropIndex(
                name: "IX_WorcTemplates_FlowVersionId",
                table: "WorcTemplates");

            migrationBuilder.RenameColumn(
                name: "FlowVersionId",
                table: "WorcTemplates",
                newName: "RefId");

            migrationBuilder.AddColumn<int>(
                name: "AccessType",
                table: "WorcTemplates",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "Icons",
                table: "WorcTemplates",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "Tags",
                table: "WorcTemplates",
                type: "text[]",
                nullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccessType",
                table: "WorcTemplates");

            migrationBuilder.DropColumn(
                name: "Icons",
                table: "WorcTemplates");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "WorcTemplates");

            migrationBuilder.RenameColumn(
                name: "RefId",
                table: "WorcTemplates",
                newName: "FlowVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_WorcTemplates_FlowVersionId",
                table: "WorcTemplates",
                column: "FlowVersionId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorcTemplates_FlowVersions_FlowVersionId",
                table: "WorcTemplates",
                column: "FlowVersionId",
                principalTable: "FlowVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
