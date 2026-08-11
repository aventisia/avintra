using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationSchemaUpdates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ReadOn",
                table: "NotificationUsers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AudienceScope",
                table: "Notifications",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryChannel",
                table: "Notifications",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsSuperAdminNotification",
                table: "Notifications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "RecurrenceEndOn",
                table: "Notifications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecurrenceFrequency",
                table: "Notifications",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecurrenceInterval",
                table: "Notifications",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecurrenceMonthDays",
                table: "Notifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecurrenceWeekdays",
                table: "Notifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ScheduledFor",
                table: "Notifications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "SentOn",
                table: "Notifications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceType",
                table: "Notifications",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Notifications",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Notifications",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReadOn",
                table: "NotificationUsers");

            migrationBuilder.DropColumn(
                name: "AudienceScope",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "DeliveryChannel",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "IsSuperAdminNotification",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "RecurrenceEndOn",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "RecurrenceFrequency",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "RecurrenceInterval",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "RecurrenceMonthDays",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "RecurrenceWeekdays",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "ScheduledFor",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "SentOn",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "SourceType",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Notifications");
        }
    }
}
