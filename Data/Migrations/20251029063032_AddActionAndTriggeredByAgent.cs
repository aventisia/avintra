using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddActionAndTriggeredByAgent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Action",
                table: "CreditUsages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TriggeredByAgent",
                table: "CreditUsages",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Action",
                table: "CreditUsages");

            migrationBuilder.DropColumn(
                name: "TriggeredByAgent",
                table: "CreditUsages");
        }
    }
}
