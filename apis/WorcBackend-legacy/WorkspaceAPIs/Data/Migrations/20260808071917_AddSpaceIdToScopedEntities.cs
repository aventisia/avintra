using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSpaceIdToScopedEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "ws_Tools",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "ws_Jobs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "ws_ApiKeys",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "worc_Triggers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "worc_TimeTriggers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "worc_Skills",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "worc_SkillFiles",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "worc_KBs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "worc_KBFiles",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "worc_Conversations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "Vaults",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "Queues",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "Machines",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "KeyStores",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "Flows",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "AppSecrets",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "ws_Tools");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "ws_Jobs");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "ws_ApiKeys");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "worc_Triggers");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "worc_TimeTriggers");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "worc_Skills");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "worc_SkillFiles");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "worc_KBs");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "worc_KBFiles");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "worc_Conversations");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "Vaults");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "KeyStores");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "Flows");

            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "AppSecrets");
        }
    }
}
