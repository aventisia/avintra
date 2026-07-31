using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddToolRegistryTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "worc_Skills",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ws_Tools",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: false),
                    BaseUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    OpenApiSpec = table.Column<string>(type: "text", nullable: true),
                    ParsedSchema = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    AuthenticationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CredentialId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsTenantWideAccess = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ws_Tools", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ws_Tools_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ws_Tools_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FlowVersion_Tool",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ToolId = table.Column<Guid>(type: "uuid", nullable: false),
                    AllowedOperations = table.Column<List<string>>(type: "text[]", nullable: true),
                    CredentialId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
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

            migrationBuilder.CreateIndex(
                name: "IX_ws_Tools_CreatedByUserId",
                table: "ws_Tools",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ws_Tools_LastModifiedByUserId",
                table: "ws_Tools",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ws_Tools_TenantId_Name",
                table: "ws_Tools",
                columns: new[] { "TenantId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FlowVersion_Tool");

            migrationBuilder.DropTable(
                name: "ws_Tools");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "worc_Skills");
        }
    }
}
