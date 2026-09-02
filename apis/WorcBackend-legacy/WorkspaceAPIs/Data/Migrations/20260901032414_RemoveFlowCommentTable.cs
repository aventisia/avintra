using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveFlowCommentTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FlowComment");

            migrationBuilder.DropIndex(
                name: "IX_Flows_CreatedByUserId_Name",
                table: "Flows");

            migrationBuilder.CreateIndex(
                name: "IX_Flows_CreatedByUserId",
                table: "Flows",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Flows_TenantId_Name",
                table: "Flows",
                columns: new[] { "TenantId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Flows_CreatedByUserId",
                table: "Flows");

            migrationBuilder.DropIndex(
                name: "IX_Flows_TenantId_Name",
                table: "Flows");

            migrationBuilder.CreateTable(
                name: "FlowComment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Comment = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsEdited = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlowComment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FlowComment_Flows_FlowId",
                        column: x => x.FlowId,
                        principalTable: "Flows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FlowComment_WorkspaceUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Flows_CreatedByUserId_Name",
                table: "Flows",
                columns: new[] { "CreatedByUserId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FlowComment_FlowId",
                table: "FlowComment",
                column: "FlowId");

            migrationBuilder.CreateIndex(
                name: "IX_FlowComment_UserId",
                table: "FlowComment",
                column: "UserId");
        }
    }
}
