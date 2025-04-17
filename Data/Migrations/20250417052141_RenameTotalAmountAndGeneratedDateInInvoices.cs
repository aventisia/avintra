using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameTotalAmountAndGeneratedDateInInvoices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TotalAmount",
                table: "Invoices",
                newName: "AmountReceived");

            migrationBuilder.RenameColumn(
                name: "GeneratedDate",
                table: "Invoices",
                newName: "AmountReceivedOn");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AmountReceivedOn",
                table: "Invoices",
                newName: "GeneratedDate");

            migrationBuilder.RenameColumn(
                name: "AmountReceived",
                table: "Invoices",
                newName: "TotalAmount");
        }
    }
}
