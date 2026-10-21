using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddResourceFlowAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsResourceAccessRestricted",
                table: "ws_Tools",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "ws_ResourceFlowAccess",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ResourceType = table.Column<string>(type: "text", nullable: false),
                    ResourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ws_ResourceFlowAccess", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ws_ResourceFlowAccess_Flows_FlowId",
                        column: x => x.FlowId,
                        principalTable: "Flows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ws_ResourceFlowAccess_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ws_ResourceFlowAccess_CreatedByUserId",
                table: "ws_ResourceFlowAccess",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ws_ResourceFlowAccess_FlowId",
                table: "ws_ResourceFlowAccess",
                column: "FlowId");

            migrationBuilder.CreateIndex(
                name: "IX_ws_ResourceFlowAccess_TenantId_ResourceType_ResourceId_Flow~",
                table: "ws_ResourceFlowAccess",
                columns: new[] { "TenantId", "ResourceType", "ResourceId", "FlowId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ws_ResourceFlowAccess");

            migrationBuilder.DropColumn(
                name: "IsResourceAccessRestricted",
                table: "ws_Tools");
        }
    }
}
