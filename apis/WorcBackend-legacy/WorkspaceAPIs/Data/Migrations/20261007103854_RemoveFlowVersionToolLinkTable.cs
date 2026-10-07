using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveFlowVersionToolLinkTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FlowVersion_Tool");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FlowVersion_Tool",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ToolId = table.Column<Guid>(type: "uuid", nullable: false),
                    AllowedOperations = table.Column<List<string>>(type: "text[]", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CredentialName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlowVersion_Tool", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FlowVersion_Tool_FlowVersions_FlowVersionId",
                        column: x => x.FlowVersionId,
                        principalTable: "FlowVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FlowVersion_Tool_ws_Tools_ToolId",
                        column: x => x.ToolId,
                        principalTable: "ws_Tools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FlowVersion_Tool_FlowVersionId",
                table: "FlowVersion_Tool",
                column: "FlowVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_FlowVersion_Tool_TenantId_FlowVersionId_ToolId",
                table: "FlowVersion_Tool",
                columns: new[] { "TenantId", "FlowVersionId", "ToolId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FlowVersion_Tool_ToolId",
                table: "FlowVersion_Tool",
                column: "ToolId");
        }
    }
}
