using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTimeTriggerSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SetupObject",
                table: "worc_TimeTriggers",
                newName: "CronExpression");

            migrationBuilder.AddColumn<TimeOnly>(
                name: "AtTime",
                table: "worc_TimeTriggers",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Interval",
                table: "worc_TimeTriggers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<List<int>>(
                name: "MonthDays",
                table: "worc_TimeTriggers",
                type: "integer[]",
                nullable: true);

            migrationBuilder.AddColumn<List<int>>(
                name: "Weekdays",
                table: "worc_TimeTriggers",
                type: "integer[]",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AtTime",
                table: "worc_TimeTriggers");

            migrationBuilder.DropColumn(
                name: "Interval",
                table: "worc_TimeTriggers");

            migrationBuilder.DropColumn(
                name: "MonthDays",
                table: "worc_TimeTriggers");

            migrationBuilder.DropColumn(
                name: "Weekdays",
                table: "worc_TimeTriggers");

            migrationBuilder.RenameColumn(
                name: "CronExpression",
                table: "worc_TimeTriggers",
                newName: "SetupObject");
        }
    }
}
