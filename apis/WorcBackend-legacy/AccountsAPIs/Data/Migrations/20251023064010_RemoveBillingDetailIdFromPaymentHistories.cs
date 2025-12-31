using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveBillingDetailIdFromPaymentHistories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentHistories_BillingDetails_BillingDetailId",
                table: "PaymentHistories");

            migrationBuilder.DropIndex(
                name: "IX_PaymentHistories_BillingDetailId",
                table: "PaymentHistories");

            migrationBuilder.DropColumn(
                name: "BillingDetailId",
                table: "PaymentHistories");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BillingDetailId",
                table: "PaymentHistories",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentHistories_BillingDetailId",
                table: "PaymentHistories",
                column: "BillingDetailId");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentHistories_BillingDetails_BillingDetailId",
                table: "PaymentHistories",
                column: "BillingDetailId",
                principalTable: "BillingDetails",
                principalColumn: "Id");
        }
    }
}
