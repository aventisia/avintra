using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class Add_ProjectId_In_Model : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ProjectId",
                table: "MLModels",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "MLModels");
        }
    }
}
