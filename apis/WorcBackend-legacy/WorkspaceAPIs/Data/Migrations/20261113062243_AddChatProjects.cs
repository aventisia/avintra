using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddChatProjects : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ProjectId",
                table: "run_Conversations",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "chat_projects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_chat_projects_user_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "user_WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_chat_projects_user_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "user_WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_run_Conversations_ProjectId",
                table: "run_Conversations",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_chat_projects_CreatedByUserId",
                table: "chat_projects",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_chat_projects_LastModifiedByUserId",
                table: "chat_projects",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_chat_projects_TenantId_UserId",
                table: "chat_projects",
                columns: new[] { "TenantId", "UserId" });

            migrationBuilder.AddForeignKey(
                name: "FK_run_Conversations_chat_projects_ProjectId",
                table: "run_Conversations",
                column: "ProjectId",
                principalTable: "chat_projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_run_Conversations_chat_projects_ProjectId",
                table: "run_Conversations");

            migrationBuilder.DropTable(
                name: "chat_projects");

            migrationBuilder.DropIndex(
                name: "IX_run_Conversations_ProjectId",
                table: "run_Conversations");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "run_Conversations");
        }
    }
}
