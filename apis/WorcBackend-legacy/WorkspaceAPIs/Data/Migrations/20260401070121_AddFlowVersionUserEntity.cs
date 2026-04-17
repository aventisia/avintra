using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFlowVersionUserEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "worc_FlowVersionUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_worc_FlowVersionUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_worc_FlowVersionUsers_FlowVersions_FlowVersionId",
                        column: x => x.FlowVersionId,
                        principalTable: "FlowVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_FlowVersionUsers_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_FlowVersionUsers_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_FlowVersionUsers_WorkspaceUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_worc_FlowVersionUsers_CreatedByUserId",
                table: "worc_FlowVersionUsers",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_FlowVersionUsers_FlowVersionId",
                table: "worc_FlowVersionUsers",
                column: "FlowVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_FlowVersionUsers_LastModifiedByUserId",
                table: "worc_FlowVersionUsers",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_FlowVersionUsers_UserId",
                table: "worc_FlowVersionUsers",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "worc_FlowVersionUsers");
        }
    }
}
