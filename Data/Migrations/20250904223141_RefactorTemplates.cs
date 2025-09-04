using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RefactorTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSetuptTest",
                table: "worc_TemplateResources");

            migrationBuilder.DropColumn(
                name: "ResourceText",
                table: "worc_TemplateResources");

            migrationBuilder.DropColumn(
                name: "SpaceIds",
                table: "worc_ProjectTemplates");

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "worc_TemplateResources",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "worc_ProjectTemplates",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "SpaceId",
                table: "worc_ProjectTemplates",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SpaceId",
                table: "worc_ProjectTemplates");

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "worc_TemplateResources",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSetuptTest",
                table: "worc_TemplateResources",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ResourceText",
                table: "worc_TemplateResources",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "worc_ProjectTemplates",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<List<Guid>>(
                name: "SpaceIds",
                table: "worc_ProjectTemplates",
                type: "uuid[]",
                nullable: true);
        }
    }
}
