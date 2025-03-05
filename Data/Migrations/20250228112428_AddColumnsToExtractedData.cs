using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Migrations
{
    /// <inheritdoc />
    public partial class AddColumnsToExtractedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Accuracy",
                table: "ExtractedData",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DocId",
                table: "ExtractedData",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UploadedDocId",
                table: "ExtractedData",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExtractedData_DocId",
                table: "ExtractedData",
                column: "DocId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ExtractedData_UploadedDocs_DocId",
                table: "ExtractedData",
                column: "DocId",
                principalTable: "UploadedDocs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExtractedData_UploadedDocs_DocId",
                table: "ExtractedData");

            migrationBuilder.DropIndex(
                name: "IX_ExtractedData_DocId",
                table: "ExtractedData");

            migrationBuilder.DropColumn(
                name: "Accuracy",
                table: "ExtractedData");

            migrationBuilder.DropColumn(
                name: "DocId",
                table: "ExtractedData");

            migrationBuilder.DropColumn(
                name: "UploadedDocId",
                table: "ExtractedData");
        }
    }
}
