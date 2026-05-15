using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddChunksCountToKBFile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_worc_KBFiles_KnowledgeBaseId",
                table: "worc_KBFiles");

            migrationBuilder.AddColumn<int>(
                name: "ChunksCount",
                table: "worc_KBFiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_worc_KBs_TenantId_Name",
                table: "worc_KBs",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_worc_KBFiles_KnowledgeBaseId_FileName",
                table: "worc_KBFiles",
                columns: new[] { "KnowledgeBaseId", "FileName" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_worc_KBs_TenantId_Name",
                table: "worc_KBs");

            migrationBuilder.DropIndex(
                name: "IX_worc_KBFiles_KnowledgeBaseId_FileName",
                table: "worc_KBFiles");

            migrationBuilder.DropColumn(
                name: "ChunksCount",
                table: "worc_KBFiles");

            migrationBuilder.CreateIndex(
                name: "IX_worc_KBFiles_KnowledgeBaseId",
                table: "worc_KBFiles",
                column: "KnowledgeBaseId");
        }
    }
}
