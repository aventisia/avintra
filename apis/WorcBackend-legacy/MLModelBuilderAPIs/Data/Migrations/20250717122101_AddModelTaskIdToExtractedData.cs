using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddModelTaskIdToExtractedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ExtractedData_DocId",
                table: "ExtractedData");

            migrationBuilder.AddColumn<Guid>(
                name: "ModelTaskId",
                table: "ExtractedData",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_ExtractedData_DocId",
                table: "ExtractedData",
                column: "DocId");

            migrationBuilder.CreateIndex(
                name: "IX_ExtractedData_ModelTaskId",
                table: "ExtractedData",
                column: "ModelTaskId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ExtractedData_ModelTasks_ModelTaskId",
                table: "ExtractedData",
                column: "ModelTaskId",
                principalTable: "ModelTasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExtractedData_ModelTasks_ModelTaskId",
                table: "ExtractedData");

            migrationBuilder.DropIndex(
                name: "IX_ExtractedData_DocId",
                table: "ExtractedData");

            migrationBuilder.DropIndex(
                name: "IX_ExtractedData_ModelTaskId",
                table: "ExtractedData");

            migrationBuilder.DropColumn(
                name: "ModelTaskId",
                table: "ExtractedData");

            migrationBuilder.CreateIndex(
                name: "IX_ExtractedData_DocId",
                table: "ExtractedData",
                column: "DocId",
                unique: true);
        }
    }
}
