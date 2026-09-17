using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRetryTimeAndCountToQueueTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SourceQueueTransactionId",
                table: "QueueTransactions");

            migrationBuilder.AddColumn<int>(
                name: "RetryCount",
                table: "QueueTransactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "RetryTime",
                table: "QueueTransactions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SourceWorkItemId",
                table: "QueueTransactions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_QueueTransactions_SourceWorkItemId_RetryCount",
                table: "QueueTransactions",
                columns: new[] { "SourceWorkItemId", "RetryCount" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_QueueTransactions_SourceWorkItemId_RetryCount",
                table: "QueueTransactions");

            migrationBuilder.DropColumn(
                name: "RetryCount",
                table: "QueueTransactions");

            migrationBuilder.DropColumn(
                name: "RetryTime",
                table: "QueueTransactions");

            migrationBuilder.DropColumn(
                name: "SourceWorkItemId",
                table: "QueueTransactions");

            migrationBuilder.AddColumn<Guid>(
                name: "SourceQueueTransactionId",
                table: "QueueTransactions",
                type: "uuid",
                nullable: true);
        }
    }
}
