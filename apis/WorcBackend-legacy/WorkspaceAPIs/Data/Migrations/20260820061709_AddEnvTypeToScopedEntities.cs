using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEnvTypeToScopedEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ws_Tools_TenantId_Name",
                table: "ws_Tools");

            migrationBuilder.DropIndex(
                name: "IX_worc_Skills_TenantId_Name",
                table: "worc_Skills");

            migrationBuilder.DropIndex(
                name: "IX_worc_KBs_TenantId_Name",
                table: "worc_KBs");

            migrationBuilder.AddColumn<string>(
                name: "EnvType",
                table: "ws_Tools",
                type: "text",
                nullable: false,
                defaultValue: "Dev");

            migrationBuilder.AddColumn<string>(
                name: "EnvType",
                table: "worc_Triggers",
                type: "text",
                nullable: false,
                defaultValue: "Dev");

            migrationBuilder.AddColumn<string>(
                name: "EnvType",
                table: "worc_Skills",
                type: "text",
                nullable: false,
                defaultValue: "Dev");

            migrationBuilder.AddColumn<string>(
                name: "EnvType",
                table: "worc_KBs",
                type: "text",
                nullable: false,
                defaultValue: "Dev");

            migrationBuilder.AddColumn<string>(
                name: "EnvType",
                table: "Vaults",
                type: "text",
                nullable: false,
                defaultValue: "Dev");

            migrationBuilder.AddColumn<string>(
                name: "EnvType",
                table: "Queues",
                type: "text",
                nullable: false,
                defaultValue: "Dev");

            migrationBuilder.AddColumn<string>(
                name: "EnvType",
                table: "KeyStores",
                type: "text",
                nullable: false,
                defaultValue: "Dev");

            migrationBuilder.AddColumn<string>(
                name: "ResourceReferences",
                table: "FlowVersions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnvType",
                table: "AppSecrets",
                type: "text",
                nullable: false,
                defaultValue: "Dev");

            migrationBuilder.CreateIndex(
                name: "IX_ws_Tools_TenantId_SpaceId_EnvType_Name",
                table: "ws_Tools",
                columns: new[] { "TenantId", "SpaceId", "EnvType", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_worc_Triggers_TenantId_SpaceId_EnvType_Name",
                table: "worc_Triggers",
                columns: new[] { "TenantId", "SpaceId", "EnvType", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_worc_Skills_TenantId_SpaceId_EnvType_Name",
                table: "worc_Skills",
                columns: new[] { "TenantId", "SpaceId", "EnvType", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_worc_KBs_TenantId_SpaceId_EnvType_Name",
                table: "worc_KBs",
                columns: new[] { "TenantId", "SpaceId", "EnvType", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vaults_TenantId_SpaceId_EnvType_Name",
                table: "Vaults",
                columns: new[] { "TenantId", "SpaceId", "EnvType", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Queues_TenantId_SpaceId_EnvType_Name",
                table: "Queues",
                columns: new[] { "TenantId", "SpaceId", "EnvType", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KeyStores_TenantId_SpaceId_EnvType_Name",
                table: "KeyStores",
                columns: new[] { "TenantId", "SpaceId", "EnvType", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppSecrets_TenantId_SpaceId_EnvType_Name",
                table: "AppSecrets",
                columns: new[] { "TenantId", "SpaceId", "EnvType", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ws_Tools_TenantId_SpaceId_EnvType_Name",
                table: "ws_Tools");

            migrationBuilder.DropIndex(
                name: "IX_worc_Triggers_TenantId_SpaceId_EnvType_Name",
                table: "worc_Triggers");

            migrationBuilder.DropIndex(
                name: "IX_worc_Skills_TenantId_SpaceId_EnvType_Name",
                table: "worc_Skills");

            migrationBuilder.DropIndex(
                name: "IX_worc_KBs_TenantId_SpaceId_EnvType_Name",
                table: "worc_KBs");

            migrationBuilder.DropIndex(
                name: "IX_Vaults_TenantId_SpaceId_EnvType_Name",
                table: "Vaults");

            migrationBuilder.DropIndex(
                name: "IX_Queues_TenantId_SpaceId_EnvType_Name",
                table: "Queues");

            migrationBuilder.DropIndex(
                name: "IX_KeyStores_TenantId_SpaceId_EnvType_Name",
                table: "KeyStores");

            migrationBuilder.DropIndex(
                name: "IX_AppSecrets_TenantId_SpaceId_EnvType_Name",
                table: "AppSecrets");

            migrationBuilder.DropColumn(
                name: "EnvType",
                table: "ws_Tools");

            migrationBuilder.DropColumn(
                name: "EnvType",
                table: "worc_Triggers");

            migrationBuilder.DropColumn(
                name: "EnvType",
                table: "worc_Skills");

            migrationBuilder.DropColumn(
                name: "EnvType",
                table: "worc_KBs");

            migrationBuilder.DropColumn(
                name: "EnvType",
                table: "Vaults");

            migrationBuilder.DropColumn(
                name: "EnvType",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "EnvType",
                table: "KeyStores");

            migrationBuilder.DropColumn(
                name: "ResourceReferences",
                table: "FlowVersions");

            migrationBuilder.DropColumn(
                name: "EnvType",
                table: "AppSecrets");

            migrationBuilder.CreateIndex(
                name: "IX_ws_Tools_TenantId_Name",
                table: "ws_Tools",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_worc_Skills_TenantId_Name",
                table: "worc_Skills",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_worc_KBs_TenantId_Name",
                table: "worc_KBs",
                columns: new[] { "TenantId", "Name" },
                unique: true);
        }
    }
}
