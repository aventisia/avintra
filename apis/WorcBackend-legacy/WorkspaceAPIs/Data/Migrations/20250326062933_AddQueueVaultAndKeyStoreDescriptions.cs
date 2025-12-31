using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddQueueVaultAndKeyStoreDescriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Vaults",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Queues",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsStoredEncrypted",
                table: "Queues",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsUniqueReferencesEnforced",
                table: "Queues",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaximumRetryAttempts",
                table: "Queues",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "OutputDataSchemaPath",
                table: "Queues",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ShouldRetryAbandonedItems",
                table: "Queues",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShouldRetryFailedItems",
                table: "Queues",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SpecificDataSchemaPath",
                table: "Queues",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "KeyStores",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Vaults");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "IsStoredEncrypted",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "IsUniqueReferencesEnforced",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "MaximumRetryAttempts",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "OutputDataSchemaPath",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "ShouldRetryAbandonedItems",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "ShouldRetryFailedItems",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "SpecificDataSchemaPath",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "KeyStores");
        }
    }
}
