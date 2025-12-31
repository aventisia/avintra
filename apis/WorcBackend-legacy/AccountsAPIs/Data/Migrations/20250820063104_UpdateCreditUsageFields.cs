using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCreditUsageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CreditUsages_AspNetUsers_UsageByUserId",
                table: "CreditUsages");

            migrationBuilder.RenameColumn(
                name: "UsageOn",
                table: "CreditUsages",
                newName: "UsedAt");

            migrationBuilder.RenameColumn(
                name: "UsageByUserId",
                table: "CreditUsages",
                newName: "UsedByUserId");

            migrationBuilder.RenameColumn(
                name: "Credits",
                table: "CreditUsages",
                newName: "CreditsUsed");

            migrationBuilder.RenameIndex(
                name: "IX_CreditUsages_UsageByUserId",
                table: "CreditUsages",
                newName: "IX_CreditUsages_UsedByUserId");

            migrationBuilder.AddColumn<string>(
                name: "RefName",
                table: "CreditUsages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefType",
                table: "CreditUsages",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CreditUsages_AspNetUsers_UsedByUserId",
                table: "CreditUsages",
                column: "UsedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CreditUsages_AspNetUsers_UsedByUserId",
                table: "CreditUsages");

            migrationBuilder.DropColumn(
                name: "RefName",
                table: "CreditUsages");

            migrationBuilder.DropColumn(
                name: "RefType",
                table: "CreditUsages");

            migrationBuilder.RenameColumn(
                name: "UsedByUserId",
                table: "CreditUsages",
                newName: "UsageByUserId");

            migrationBuilder.RenameColumn(
                name: "UsedAt",
                table: "CreditUsages",
                newName: "UsageOn");

            migrationBuilder.RenameColumn(
                name: "CreditsUsed",
                table: "CreditUsages",
                newName: "Credits");

            migrationBuilder.RenameIndex(
                name: "IX_CreditUsages_UsedByUserId",
                table: "CreditUsages",
                newName: "IX_CreditUsages_UsageByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CreditUsages_AspNetUsers_UsageByUserId",
                table: "CreditUsages",
                column: "UsageByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
