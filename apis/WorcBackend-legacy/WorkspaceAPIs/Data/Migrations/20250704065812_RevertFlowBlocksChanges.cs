using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RevertFlowBlocksChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Flows_FlowBlocks_FlowBlockId",
                table: "Flows");

            migrationBuilder.DropTable(
                name: "FlowBlocks");

            migrationBuilder.DropIndex(
                name: "IX_Flows_FlowBlockId",
                table: "Flows");

            migrationBuilder.DropColumn(
                name: "FlowBlockId",
                table: "Flows");

            migrationBuilder.CreateTable(
                name: "Blocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: false),
                    ReactFlowObject = table.Column<string>(type: "text", nullable: true),
                    FlowVariablesObject = table.Column<string>(type: "text", nullable: true),
                    InputOutputObject = table.Column<string>(type: "text", nullable: true),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Blocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Blocks_FlowVersions_FlowVersionId",
                        column: x => x.FlowVersionId,
                        principalTable: "FlowVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Blocks_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Blocks_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Blocks_CreatedByUserId",
                table: "Blocks",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Blocks_FlowVersionId",
                table: "Blocks",
                column: "FlowVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_Blocks_LastModifiedByUserId",
                table: "Blocks",
                column: "LastModifiedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Blocks");

            migrationBuilder.AddColumn<Guid>(
                name: "FlowBlockId",
                table: "Flows",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FlowBlocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    FlowVariablesObject = table.Column<string>(type: "text", nullable: true),
                    InputOutputObject = table.Column<string>(type: "text", nullable: true),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ReactFlowObject = table.Column<string>(type: "text", nullable: true),
                    RefId = table.Column<Guid>(type: "uuid", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlowBlocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FlowBlocks_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FlowBlocks_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Flows_FlowBlockId",
                table: "Flows",
                column: "FlowBlockId");

            migrationBuilder.CreateIndex(
                name: "IX_FlowBlocks_CreatedByUserId",
                table: "FlowBlocks",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FlowBlocks_LastModifiedByUserId",
                table: "FlowBlocks",
                column: "LastModifiedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Flows_FlowBlocks_FlowBlockId",
                table: "Flows",
                column: "FlowBlockId",
                principalTable: "FlowBlocks",
                principalColumn: "Id");
        }
    }
}
