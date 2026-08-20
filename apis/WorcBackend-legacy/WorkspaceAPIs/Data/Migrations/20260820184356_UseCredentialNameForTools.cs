using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UseCredentialNameForTools : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CredentialId",
                table: "ws_Tools");

            migrationBuilder.DropColumn(
                name: "CredentialId",
                table: "FlowVersion_Tool");

            migrationBuilder.AddColumn<string>(
                name: "CredentialName",
                table: "ws_Tools",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CredentialName",
                table: "FlowVersion_Tool",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CredentialName",
                table: "ws_Tools");

            migrationBuilder.DropColumn(
                name: "CredentialName",
                table: "FlowVersion_Tool");

            migrationBuilder.AddColumn<Guid>(
                name: "CredentialId",
                table: "ws_Tools",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CredentialId",
                table: "FlowVersion_Tool",
                type: "uuid",
                nullable: true);
        }
    }
}
