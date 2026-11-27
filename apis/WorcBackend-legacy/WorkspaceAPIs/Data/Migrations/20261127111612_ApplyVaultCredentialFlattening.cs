using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class ApplyVaultCredentialFlattening : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Pre-flattening family credentials keep their previous sibling plugin access.
            migrationBuilder.Sql("""
                UPDATE "vault_Credentials"
                SET "LegacyFamilyAccess" = TRUE
                WHERE "Type" IN ('M365', 'GoogleWorkspace', 'Teams', 'Onedrive', 'Sharepoint', 'SendGrid');
                """);

            // Present the umbrella types as their historical primary service.
            migrationBuilder.Sql("""
                UPDATE "vault_Credentials"
                SET "Type" = 'Outlook'
                WHERE "Type" = 'M365';
                """);

            migrationBuilder.Sql("""
                UPDATE "vault_Credentials"
                SET "Type" = 'Gmail'
                WHERE "Type" = 'GoogleWorkspace';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "vault_Credentials"
                SET "Type" = 'GoogleWorkspace'
                WHERE "Type" = 'Gmail' AND "LegacyFamilyAccess" = TRUE;
                """);

            migrationBuilder.Sql("""
                UPDATE "vault_Credentials"
                SET "Type" = 'M365'
                WHERE "Type" = 'Outlook' AND "LegacyFamilyAccess" = TRUE;
                """);

            migrationBuilder.Sql("""
                UPDATE "vault_Credentials"
                SET "LegacyFamilyAccess" = FALSE
                WHERE "LegacyFamilyAccess" = TRUE;
                """);
        }
    }
}
