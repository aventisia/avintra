using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class QueueSchemaChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QueueTransactions_WorkspaceUsers_CreatedByUserId",
                table: "QueueTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_QueueTransactions_WorkspaceUsers_LastModifiedByUserId",
                table: "QueueTransactions");

            migrationBuilder.DropIndex(
                name: "IX_QueueTransactions_CreatedByUserId",
                table: "QueueTransactions");

            migrationBuilder.DropIndex(
                name: "IX_QueueTransactions_LastModifiedByUserId",
                table: "QueueTransactions");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "QueueTransactions");

            migrationBuilder.DropColumn(
                name: "LastModifiedByUserId",
                table: "QueueTransactions");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "QueueTransactions");

            migrationBuilder.RenameColumn(
                name: "SpecificDataSchemaPath",
                table: "Queues",
                newName: "OutputSchema");

            migrationBuilder.RenameColumn(
                name: "OutputDataSchemaPath",
                table: "Queues",
                newName: "InputSchema");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "QueueTransactions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "QueueTransactions");

            migrationBuilder.RenameColumn(
                name: "OutputSchema",
                table: "Queues",
                newName: "SpecificDataSchemaPath");

            migrationBuilder.RenameColumn(
                name: "InputSchema",
                table: "Queues",
                newName: "OutputDataSchemaPath");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "QueueTransactions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "LastModifiedByUserId",
                table: "QueueTransactions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "QueueTransactions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.CreateIndex(
                name: "IX_QueueTransactions_CreatedByUserId",
                table: "QueueTransactions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_QueueTransactions_LastModifiedByUserId",
                table: "QueueTransactions",
                column: "LastModifiedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_QueueTransactions_WorkspaceUsers_CreatedByUserId",
                table: "QueueTransactions",
                column: "CreatedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QueueTransactions_WorkspaceUsers_LastModifiedByUserId",
                table: "QueueTransactions",
                column: "LastModifiedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
