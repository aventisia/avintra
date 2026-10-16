using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUiBuilderPublishAssign : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "UiBuilderProjects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublishedTenantWide",
                table: "UiBuilderProjects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "UiBuilderProjectUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UiBuilderProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UiBuilderProjectUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UiBuilderProjectUsers_UiBuilderProjects_UiBuilderProjectId",
                        column: x => x.UiBuilderProjectId,
                        principalTable: "UiBuilderProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UiBuilderProjectUsers_WorkspaceUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderProjectUsers_UiBuilderProjectId_UserId",
                table: "UiBuilderProjectUsers",
                columns: new[] { "UiBuilderProjectId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderProjectUsers_UserId",
                table: "UiBuilderProjectUsers",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UiBuilderProjectUsers");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "UiBuilderProjects");

            migrationBuilder.DropColumn(
                name: "IsPublishedTenantWide",
                table: "UiBuilderProjects");
        }
    }
}
