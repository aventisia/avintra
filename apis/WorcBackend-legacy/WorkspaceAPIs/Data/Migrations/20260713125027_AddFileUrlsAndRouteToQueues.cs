using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFileUrlsAndRouteToQueues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileUrl",
                table: "QueueTransactions");

            migrationBuilder.AddColumn<List<string>>(
                name: "FileUrls",
                table: "QueueTransactions",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "RouteToQueues",
                table: "Queues",
                type: "text[]",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileUrls",
                table: "QueueTransactions");

            migrationBuilder.DropColumn(
                name: "RouteToQueues",
                table: "Queues");

            migrationBuilder.AddColumn<string>(
                name: "FileUrl",
                table: "QueueTransactions",
                type: "text",
                nullable: true);
        }
    }
}
