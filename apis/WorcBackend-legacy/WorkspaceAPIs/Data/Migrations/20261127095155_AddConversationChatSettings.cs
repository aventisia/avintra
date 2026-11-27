using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddConversationChatSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ModelId",
                table: "run_Conversations",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModelProvider",
                table: "run_Conversations",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReasoningEffort",
                table: "run_Conversations",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "WebSearch",
                table: "run_Conversations",
                type: "boolean",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModelId",
                table: "run_Conversations");

            migrationBuilder.DropColumn(
                name: "ModelProvider",
                table: "run_Conversations");

            migrationBuilder.DropColumn(
                name: "ReasoningEffort",
                table: "run_Conversations");

            migrationBuilder.DropColumn(
                name: "WebSearch",
                table: "run_Conversations");
        }
    }
}
