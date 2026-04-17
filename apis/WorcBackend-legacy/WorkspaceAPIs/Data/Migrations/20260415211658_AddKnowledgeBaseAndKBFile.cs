using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddKnowledgeBaseAndKBFile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "worc_KBs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    VectorStore = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EmbeddingProvider = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    EmbeddingModel = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    EmbeddingCredentialId = table.Column<Guid>(type: "uuid", nullable: true),
                    StoreCredentialId = table.Column<Guid>(type: "uuid", nullable: true),
                    CollectionName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    VectorStoreConfig = table.Column<string>(type: "text", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_worc_KBs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_worc_KBs_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_KBs_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "worc_KBFiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    KnowledgeBaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Extension = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SizeInBytes = table.Column<long>(type: "bigint", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    VectorizationErrorMessage = table.Column<string>(type: "text", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_worc_KBFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_worc_KBFiles_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_KBFiles_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_KBFiles_worc_KBs_KnowledgeBaseId",
                        column: x => x.KnowledgeBaseId,
                        principalTable: "worc_KBs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_worc_KBFiles_CreatedByUserId",
                table: "worc_KBFiles",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_KBFiles_KnowledgeBaseId",
                table: "worc_KBFiles",
                column: "KnowledgeBaseId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_KBFiles_LastModifiedByUserId",
                table: "worc_KBFiles",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_KBs_CreatedByUserId",
                table: "worc_KBs",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_KBs_LastModifiedByUserId",
                table: "worc_KBs",
                column: "LastModifiedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "worc_KBFiles");

            migrationBuilder.DropTable(
                name: "worc_KBs");
        }
    }
}
