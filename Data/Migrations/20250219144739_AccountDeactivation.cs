using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Migrations
{
    /// <inheritdoc />
    public partial class AccountDeactivation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhoneNumberType",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeactivatedOn",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeactivatedOn",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumberType",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }
    }
}
