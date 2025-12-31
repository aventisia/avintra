using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRazorpaySupportAndSubscriptionPlanRestructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MonthlyPrice",
                table: "SubscriptionPlans");

            migrationBuilder.RenameColumn(
                name: "YearlyPrice",
                table: "SubscriptionPlans",
                newName: "Price");

            migrationBuilder.AddColumn<int>(
                name: "HistoryRetentionDays",
                table: "TenantSubscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxCredits",
                table: "TenantSubscriptions",
                type: "numeric(20,0)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "MaxPublishedItems",
                table: "TenantSubscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxSpaces",
                table: "TenantSubscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxUsers",
                table: "TenantSubscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RazorpaySubscriptionId",
                table: "TenantSubscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StorageLimitMB",
                table: "TenantSubscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RazorpayCustomerId",
                table: "Tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Currency",
                table: "SubscriptionPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Frequency",
                table: "SubscriptionPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RazorpayPlanId",
                table: "SubscriptionPlans",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UniqueName",
                table: "SubscriptionPlans",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Country",
                table: "AspNetUsers",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HistoryRetentionDays",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "MaxCredits",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "MaxPublishedItems",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "MaxSpaces",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "MaxUsers",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "RazorpaySubscriptionId",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "StorageLimitMB",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "RazorpayCustomerId",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "Frequency",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "RazorpayPlanId",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "UniqueName",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "SubscriptionPlans",
                newName: "YearlyPrice");

            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyPrice",
                table: "SubscriptionPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
