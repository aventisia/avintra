using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddChatArtifactVersions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PreviousVersionId",
                table: "chat_artifacts",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VersionNumber",
                table: "chat_artifacts",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_chat_artifacts_PreviousVersionId",
                table: "chat_artifacts",
                column: "PreviousVersionId");

            migrationBuilder.AddForeignKey(
                name: "FK_chat_artifacts_chat_artifacts_PreviousVersionId",
                table: "chat_artifacts",
                column: "PreviousVersionId",
                principalTable: "chat_artifacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_chat_artifacts_chat_artifacts_PreviousVersionId",
                table: "chat_artifacts");

            migrationBuilder.DropIndex(
                name: "IX_chat_artifacts_PreviousVersionId",
                table: "chat_artifacts");

            migrationBuilder.DropColumn(
                name: "PreviousVersionId",
                table: "chat_artifacts");

            migrationBuilder.DropColumn(
                name: "VersionNumber",
                table: "chat_artifacts");
        }
    }
}
