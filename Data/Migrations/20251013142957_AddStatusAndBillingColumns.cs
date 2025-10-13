using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusAndBillingColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "NextBillingDate",
                table: "TenantSubscriptions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "TenantSubscriptions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "SubscriptionPlans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "SubscriptionPlans",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NextBillingDate",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "SubscriptionPlans");
        }
    }
}
