using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddResourceTypeToResourceUserAccessUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_user_ResourceUserAccess_ResourceId_UserId",
                table: "user_ResourceUserAccess");

            migrationBuilder.CreateIndex(
                name: "IX_user_ResourceUserAccess_ResourceId_ResourceType_UserId",
                table: "user_ResourceUserAccess",
                columns: new[] { "ResourceId", "ResourceType", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_user_ResourceUserAccess_ResourceId_ResourceType_UserId",
                table: "user_ResourceUserAccess");

            migrationBuilder.CreateIndex(
                name: "IX_user_ResourceUserAccess_ResourceId_UserId",
                table: "user_ResourceUserAccess",
                columns: new[] { "ResourceId", "UserId" },
                unique: true);
        }
    }
}
