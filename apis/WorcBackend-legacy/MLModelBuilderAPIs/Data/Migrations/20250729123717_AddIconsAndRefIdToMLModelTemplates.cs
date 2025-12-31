using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIconsAndRefIdToMLModelTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<string>>(
                name: "Icons",
                table: "MLModelTemplates",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RefId",
                table: "MLModelTemplates",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Icons",
                table: "MLModelTemplates");

            migrationBuilder.DropColumn(
                name: "RefId",
                table: "MLModelTemplates");
        }
    }
}
