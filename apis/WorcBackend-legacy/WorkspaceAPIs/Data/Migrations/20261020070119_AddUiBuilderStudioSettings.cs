using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUiBuilderStudioSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Label",
                table: "UiBuilderVersions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Instructions",
                table: "UiBuilderProjects",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsTemplate",
                table: "UiBuilderProjects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Theme",
                table: "UiBuilderProjects",
                type: "jsonb",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "UiBuilderAssets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    SpaceId = table.Column<Guid>(type: "uuid", nullable: true),
                    UiBuilderProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Data = table.Column<byte[]>(type: "bytea", nullable: false),
                    SizeBytes = table.Column<int>(type: "integer", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UiBuilderAssets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UiBuilderAssets_UiBuilderProjects_UiBuilderProjectId",
                        column: x => x.UiBuilderProjectId,
                        principalTable: "UiBuilderProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UiBuilderAssets_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UiBuilderAssets_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderAssets_CreatedByUserId",
                table: "UiBuilderAssets",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderAssets_LastModifiedByUserId",
                table: "UiBuilderAssets",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderAssets_UiBuilderProjectId_Name",
                table: "UiBuilderAssets",
                columns: new[] { "UiBuilderProjectId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UiBuilderAssets");

            migrationBuilder.DropColumn(
                name: "Label",
                table: "UiBuilderVersions");

            migrationBuilder.DropColumn(
                name: "Instructions",
                table: "UiBuilderProjects");

            migrationBuilder.DropColumn(
                name: "IsTemplate",
                table: "UiBuilderProjects");

            migrationBuilder.DropColumn(
                name: "Theme",
                table: "UiBuilderProjects");
        }
    }
}
