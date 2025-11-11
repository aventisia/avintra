using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameExceptionDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<List<DateOnly>>(
                name: "ExceptionDates",
                table: "worc_TimeTriggers",
                type: "date[]",
                nullable: true,
                oldClrType: typeof(List<DateTime>),
                oldType: "timestamp with time zone[]",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<List<DateTime>>(
                name: "ExceptionDates",
                table: "worc_TimeTriggers",
                type: "timestamp with time zone[]",
                nullable: true,
                oldClrType: typeof(List<DateOnly>),
                oldType: "date[]",
                oldNullable: true);
        }
    }
}
