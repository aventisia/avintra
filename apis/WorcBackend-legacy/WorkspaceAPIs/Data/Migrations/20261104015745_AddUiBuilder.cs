using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUiBuilder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UiBuilderProjects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    SpaceId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsTenantWideAccess = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublishedTenantWide = table.Column<bool>(type: "boolean", nullable: false),
                    PublishedVersionNumber = table.Column<int>(type: "integer", nullable: true),
                    DataConnections = table.Column<string>(type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    Instructions = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Theme = table.Column<string>(type: "jsonb", nullable: true),
                    IsTemplate = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UiBuilderProjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UiBuilderProjects_user_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "user_WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UiBuilderProjects_user_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "user_WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

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
                        name: "FK_UiBuilderAssets_user_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "user_WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UiBuilderAssets_user_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "user_WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

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
                        name: "FK_UiBuilderProjectUsers_user_WorkspaceUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "user_WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UiBuilderVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    SpaceId = table.Column<Guid>(type: "uuid", nullable: true),
                    UiBuilderProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    PromptText = table.Column<string>(type: "text", nullable: false),
                    GeneratedHtml = table.Column<string>(type: "text", nullable: false),
                    ContentFormat = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SourceArtifact = table.Column<string>(type: "text", nullable: true),
                    Provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UiBuilderVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UiBuilderVersions_UiBuilderProjects_UiBuilderProjectId",
                        column: x => x.UiBuilderProjectId,
                        principalTable: "UiBuilderProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UiBuilderVersions_user_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "user_WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UiBuilderVersions_user_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "user_WorkspaceUsers",
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

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderProjects_CreatedByUserId",
                table: "UiBuilderProjects",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderProjects_LastModifiedByUserId",
                table: "UiBuilderProjects",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderProjects_TenantId_Name",
                table: "UiBuilderProjects",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderProjectUsers_UiBuilderProjectId_UserId",
                table: "UiBuilderProjectUsers",
                columns: new[] { "UiBuilderProjectId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderProjectUsers_UserId",
                table: "UiBuilderProjectUsers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderVersions_CreatedByUserId",
                table: "UiBuilderVersions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderVersions_LastModifiedByUserId",
                table: "UiBuilderVersions",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UiBuilderVersions_UiBuilderProjectId",
                table: "UiBuilderVersions",
                column: "UiBuilderProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UiBuilderAssets");

            migrationBuilder.DropTable(
                name: "UiBuilderProjectUsers");

            migrationBuilder.DropTable(
                name: "UiBuilderVersions");

            migrationBuilder.DropTable(
                name: "UiBuilderProjects");
        }
    }
}
