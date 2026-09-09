using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UseCredentialNameForQueues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CredentialName",
                table: "Queues",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            // Migrate existing credential IDs to their corresponding names so existing
            // queue associations are preserved after the ID column is removed.
            migrationBuilder.Sql(@"
                UPDATE ""Queues"" q
                SET ""CredentialName"" = s.""Name""
                FROM ""AppSecrets"" s
                WHERE q.""CredentialId"" IS NOT NULL
                  AND q.""CredentialId"" = s.""Id"";
            ");

            migrationBuilder.DropColumn(
                name: "CredentialId",
                table: "Queues");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CredentialName",
                table: "Queues");

            migrationBuilder.AddColumn<Guid>(
                name: "CredentialId",
                table: "Queues",
                type: "uuid",
                nullable: true);
        }
    }
}
