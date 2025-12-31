using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBillingHistoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Amount",
                table: "BillingDetails");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "BillingDetails");

            migrationBuilder.DropColumn(
                name: "InvoiceLink",
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

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "PaymentMethods",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BillingHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    RazorpayPaymentId = table.Column<string>(type: "text", nullable: true),
                    RazorpayOrderId = table.Column<string>(type: "text", nullable: true),
                    RazorpayInvoiceId = table.Column<string>(type: "text", nullable: true),
                    PaymentStatus = table.Column<string>(type: "text", nullable: false),
                    InvoiceLink = table.Column<string>(type: "text", nullable: true),
                    BillingDetailId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BillingHistories_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BillingHistories_AspNetUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BillingHistories_BillingDetails_BillingDetailId",
                        column: x => x.BillingDetailId,
                        principalTable: "BillingDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BillingHistories_BillingDetailId",
                table: "BillingHistories",
                column: "BillingDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_BillingHistories_CreatedByUserId",
                table: "BillingHistories",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BillingHistories_LastModifiedByUserId",
                table: "BillingHistories",
                column: "LastModifiedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BillingHistories");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "PaymentMethods");

            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "BillingDetails",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "BillingDetails",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InvoiceLink",
                table: "BillingDetails",
                type: "text",
                nullable: true);

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
        }
    }
}
