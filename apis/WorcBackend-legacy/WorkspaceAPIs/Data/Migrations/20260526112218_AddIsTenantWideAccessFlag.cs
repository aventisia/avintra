using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIsTenantWideAccessFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsTenantWideAccess",
                table: "worc_Triggers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTenantWideAccess",
                table: "worc_TimeTriggers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTenantWideAccess",
                table: "worc_KBs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTenantWideAccess",
                table: "Vaults",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTenantWideAccess",
                table: "Queues",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTenantWideAccess",
                table: "KeyStores",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTenantWideAccess",
                table: "Flows",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsTenantWideAccess",
                table: "worc_Triggers");

            migrationBuilder.DropColumn(
                name: "IsTenantWideAccess",
                table: "worc_TimeTriggers");

            migrationBuilder.DropColumn(
                name: "IsTenantWideAccess",
                table: "worc_KBs");

            migrationBuilder.DropColumn(
                name: "IsTenantWideAccess",
                table: "Vaults");

            migrationBuilder.DropColumn(
                name: "IsTenantWideAccess",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "IsTenantWideAccess",
                table: "KeyStores");

            migrationBuilder.DropColumn(
                name: "IsTenantWideAccess",
                table: "Flows");
        }
    }
}
