using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLicenseCreditToInvoices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Subscriptions_SubscriptionId",
                table: "Invoices");

            migrationBuilder.AlterColumn<string>(
                name: "Frequency",
                table: "PlanPricings",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "SubscriptionId",
                table: "Invoices",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "LicenseCreditId",
                table: "Invoices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_LicenseCreditId",
                table: "Invoices",
                column: "LicenseCreditId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_LicenseCredit_LicenseCreditId",
                table: "Invoices",
                column: "LicenseCreditId",
                principalTable: "LicenseCredit",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Subscriptions_SubscriptionId",
                table: "Invoices",
                column: "SubscriptionId",
                principalTable: "Subscriptions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_LicenseCredit_LicenseCreditId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Subscriptions_SubscriptionId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_LicenseCreditId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "LicenseCreditId",
                table: "Invoices");

            migrationBuilder.AlterColumn<string>(
                name: "Frequency",
                table: "PlanPricings",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "SubscriptionId",
                table: "Invoices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Subscriptions_SubscriptionId",
                table: "Invoices",
                column: "SubscriptionId",
                principalTable: "Subscriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
