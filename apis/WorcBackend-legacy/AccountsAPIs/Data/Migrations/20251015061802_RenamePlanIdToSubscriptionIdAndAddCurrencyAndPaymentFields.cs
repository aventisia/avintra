using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenamePlanIdToSubscriptionIdAndAddCurrencyAndPaymentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BillingDetails_SubscriptionPlans_PlanId",
                table: "BillingDetails");

            migrationBuilder.DropColumn(
                name: "NextBillingDate",
                table: "BillingDetails");

            migrationBuilder.DropColumn(
                name: "TaxRate",
                table: "BillingDetails");

            migrationBuilder.RenameColumn(
                name: "PlanId",
                table: "BillingDetails",
                newName: "SubscriptionId");

            migrationBuilder.RenameIndex(
                name: "IX_BillingDetails_PlanId",
                table: "BillingDetails",
                newName: "IX_BillingDetails_SubscriptionId");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "TenantCredits",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "BillingDetails",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "BillingDetails",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RazorpayInvoiceId",
                table: "BillingDetails",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RazorpayOrderId",
                table: "BillingDetails",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RazorpayPaymentId",
                table: "BillingDetails",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BillingDetails_TenantSubscriptions_SubscriptionId",
                table: "BillingDetails",
                column: "SubscriptionId",
                principalTable: "TenantSubscriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BillingDetails_TenantSubscriptions_SubscriptionId",
                table: "BillingDetails");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "TenantCredits");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "BillingDetails");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "BillingDetails");

            migrationBuilder.DropColumn(
                name: "RazorpayInvoiceId",
                table: "BillingDetails");

            migrationBuilder.DropColumn(
                name: "RazorpayOrderId",
                table: "BillingDetails");

            migrationBuilder.DropColumn(
                name: "RazorpayPaymentId",
                table: "BillingDetails");

            migrationBuilder.RenameColumn(
                name: "SubscriptionId",
                table: "BillingDetails",
                newName: "PlanId");

            migrationBuilder.RenameIndex(
                name: "IX_BillingDetails_SubscriptionId",
                table: "BillingDetails",
                newName: "IX_BillingDetails_PlanId");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "NextBillingDate",
                table: "BillingDetails",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<decimal>(
                name: "TaxRate",
                table: "BillingDetails",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddForeignKey(
                name: "FK_BillingDetails_SubscriptionPlans_PlanId",
                table: "BillingDetails",
                column: "PlanId",
                principalTable: "SubscriptionPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
