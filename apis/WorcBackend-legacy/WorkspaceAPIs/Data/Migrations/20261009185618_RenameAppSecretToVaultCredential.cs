using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameAppSecretToVaultCredential : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EncryptedKeyValues_AppSecrets_AppSecretId",
                table: "EncryptedKeyValues");

            migrationBuilder.RenameTable(
                name: "AppSecrets",
                newName: "ws_VaultCredentials");

            migrationBuilder.Sql("ALTER TABLE \"ws_VaultCredentials\" RENAME CONSTRAINT \"FK_AppSecrets_WorkspaceUsers_CreatedByUserId\" TO \"FK_ws_VaultCredentials_WorkspaceUsers_CreatedByUserId\";");

            migrationBuilder.Sql("ALTER TABLE \"ws_VaultCredentials\" RENAME CONSTRAINT \"FK_AppSecrets_WorkspaceUsers_LastModifiedByUserId\" TO \"FK_ws_VaultCredentials_WorkspaceUsers_LastModifiedByUserId\";");

            migrationBuilder.RenameIndex(
                name: "IX_AppSecrets_CreatedByUserId",
                table: "ws_VaultCredentials",
                newName: "IX_ws_VaultCredentials_CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_AppSecrets_LastModifiedByUserId",
                table: "ws_VaultCredentials",
                newName: "IX_ws_VaultCredentials_LastModifiedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_AppSecrets_TenantId_SpaceId_EnvType_Name",
                table: "ws_VaultCredentials",
                newName: "IX_ws_VaultCredentials_TenantId_SpaceId_EnvType_Name");

            migrationBuilder.Sql("ALTER TABLE \"ws_VaultCredentials\" RENAME CONSTRAINT \"PK_AppSecrets\" TO \"PK_ws_VaultCredentials\";");

            migrationBuilder.RenameTable(
                name: "EncryptedKeyValues",
                newName: "ws_EncryptedKeyValues");

            migrationBuilder.RenameColumn(
                name: "AppSecretId",
                table: "ws_EncryptedKeyValues",
                newName: "VaultCredentialId");

            migrationBuilder.RenameIndex(
                name: "IX_EncryptedKeyValues_AppSecretId",
                table: "ws_EncryptedKeyValues",
                newName: "IX_ws_EncryptedKeyValues_VaultCredentialId");

            migrationBuilder.Sql("ALTER TABLE \"ws_EncryptedKeyValues\" RENAME CONSTRAINT \"PK_EncryptedKeyValues\" TO \"PK_ws_EncryptedKeyValues\";");

            migrationBuilder.AddForeignKey(
                name: "FK_ws_EncryptedKeyValues_ws_VaultCredentials_VaultCredentialId",
                table: "ws_EncryptedKeyValues",
                column: "VaultCredentialId",
                principalTable: "ws_VaultCredentials",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.Sql("UPDATE \"worc_ResourceShares\" SET \"ResourceType\" = 'VaultCredential' WHERE \"ResourceType\" IN ('AppSecret', 'Vault');");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ws_EncryptedKeyValues_ws_VaultCredentials_VaultCredentialId",
                table: "ws_EncryptedKeyValues");

            migrationBuilder.RenameTable(
                name: "ws_EncryptedKeyValues",
                newName: "EncryptedKeyValues");

            migrationBuilder.RenameColumn(
                name: "VaultCredentialId",
                table: "EncryptedKeyValues",
                newName: "AppSecretId");

            migrationBuilder.RenameIndex(
                name: "IX_ws_EncryptedKeyValues_VaultCredentialId",
                table: "EncryptedKeyValues",
                newName: "IX_EncryptedKeyValues_AppSecretId");

            migrationBuilder.Sql("ALTER TABLE \"EncryptedKeyValues\" RENAME CONSTRAINT \"PK_ws_EncryptedKeyValues\" TO \"PK_EncryptedKeyValues\";");

            migrationBuilder.RenameTable(
                name: "ws_VaultCredentials",
                newName: "AppSecrets");

            migrationBuilder.Sql("ALTER TABLE \"AppSecrets\" RENAME CONSTRAINT \"FK_ws_VaultCredentials_WorkspaceUsers_CreatedByUserId\" TO \"FK_AppSecrets_WorkspaceUsers_CreatedByUserId\";");

            migrationBuilder.Sql("ALTER TABLE \"AppSecrets\" RENAME CONSTRAINT \"FK_ws_VaultCredentials_WorkspaceUsers_LastModifiedByUserId\" TO \"FK_AppSecrets_WorkspaceUsers_LastModifiedByUserId\";");

            migrationBuilder.RenameIndex(
                name: "IX_ws_VaultCredentials_CreatedByUserId",
                table: "AppSecrets",
                newName: "IX_AppSecrets_CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_ws_VaultCredentials_LastModifiedByUserId",
                table: "AppSecrets",
                newName: "IX_AppSecrets_LastModifiedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_ws_VaultCredentials_TenantId_SpaceId_EnvType_Name",
                table: "AppSecrets",
                newName: "IX_AppSecrets_TenantId_SpaceId_EnvType_Name");

            migrationBuilder.Sql("ALTER TABLE \"AppSecrets\" RENAME CONSTRAINT \"PK_ws_VaultCredentials\" TO \"PK_AppSecrets\";");

            migrationBuilder.AddForeignKey(
                name: "FK_EncryptedKeyValues_AppSecrets_AppSecretId",
                table: "EncryptedKeyValues",
                column: "AppSecretId",
                principalTable: "AppSecrets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.Sql("UPDATE \"worc_ResourceShares\" SET \"ResourceType\" = 'AppSecret' WHERE \"ResourceType\" = 'VaultCredential';");
        }
    }
}
