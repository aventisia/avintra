using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformTools : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ai_PlatformTools",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    OpenApiSpec = table.Column<string>(type: "text", nullable: true),
                    ParsedSchema = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    IsPopular = table.Column<bool>(type: "boolean", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ai_PlatformTools", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ai_TenantPlatformTools",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlatformToolId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ai_TenantPlatformTools", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ai_TenantPlatformTools_ai_PlatformTools_PlatformToolId",
                        column: x => x.PlatformToolId,
                        principalTable: "ai_PlatformTools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ai_TenantPlatformTools_user_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "user_WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ai_PlatformTools_Name",
                table: "ai_PlatformTools",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ai_TenantPlatformTools_CreatedByUserId",
                table: "ai_TenantPlatformTools",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ai_TenantPlatformTools_PlatformToolId",
                table: "ai_TenantPlatformTools",
                column: "PlatformToolId");

            migrationBuilder.CreateIndex(
                name: "IX_ai_TenantPlatformTools_TenantId_PlatformToolId",
                table: "ai_TenantPlatformTools",
                columns: new[] { "TenantId", "PlatformToolId" },
                unique: true);

            migrationBuilder.Sql(
                """
                INSERT INTO "ai_PlatformTools" ("Id", "Name", "Description", "OpenApiSpec", "ParsedSchema", "IsDisabled", "IsPopular")
                SELECT
                    "Id",
                    "Name",
                    "Description",
                    "OpenApiSpec",
                    CASE
                        WHEN "ParsedSchema" IS NULL OR "AuthenticationType" IS NULL THEN "ParsedSchema"
                        ELSE jsonb_set("ParsedSchema", '{x-camel-auth-type}', to_jsonb("AuthenticationType"), true)
                    END,
                    "IsDisabled",
                    FALSE
                FROM "ai_Tools"
                WHERE "Type" = 'Platform';
                """);

            migrationBuilder.Sql(
                """
                DELETE FROM "ai_Tools" WHERE "Type" = 'Platform';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // IMPORTANT NOTE: BaseUrl is not stored on ai_PlatformTools, so a rollback restores
            // platform rows with an empty base URL; this migration is effectively forward-only.
            migrationBuilder.Sql(
                """
                INSERT INTO "ai_Tools" ("Id", "TenantId", "SpaceId", "EnvType", "Name", "Description", "Type", "BaseUrl", "OpenApiSpec", "ParsedSchema", "AuthenticationType", "IsTenantWideAccess", "IsActive", "IsVerified", "CreatedOn", "LastModifiedOn", "IsDisabled")
                SELECT
                    "Id",
                    '00000000-0000-0000-0000-000000000000',
                    NULL,
                    'Dev',
                    "Name",
                    "Description",
                    'Platform',
                    '',
                    "OpenApiSpec",
                    "ParsedSchema",
                    "ParsedSchema"->>'x-camel-auth-type',
                    TRUE,
                    TRUE,
                    TRUE,
                    NOW(),
                    NOW(),
                    "IsDisabled"
                FROM "ai_PlatformTools";
                """);

            migrationBuilder.DropTable(
                name: "ai_TenantPlatformTools");

            migrationBuilder.DropTable(
                name: "ai_PlatformTools");
        }
    }
}
