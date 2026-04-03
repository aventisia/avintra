using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnusedConversationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArchivedOn",
                table: "worc_Conversations");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "worc_Conversations");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "worc_Conversations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ArchivedOn",
                table: "worc_Conversations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "worc_Conversations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "worc_Conversations",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
