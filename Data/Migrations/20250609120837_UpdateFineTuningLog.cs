using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFineTuningLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FineTuningLogs_UploadedDocs_DocId",
                table: "FineTuningLogs");

            migrationBuilder.DropIndex(
                name: "IX_FineTuningLogs_DocId",
                table: "FineTuningLogs");

            migrationBuilder.DropColumn(
                name: "FileIds",
                table: "ScheduledModels");

            migrationBuilder.DropColumn(
                name: "DocId",
                table: "FineTuningLogs");

            migrationBuilder.AddColumn<Guid>(
                name: "FineTuningLogId",
                table: "UploadedDocs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ExtractedDataId",
                table: "ScheduledModels",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "ScheduledModels",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "ScheduledModelId1",
                table: "FineTuningLogs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UploadedDocs_FineTuningLogId",
                table: "UploadedDocs",
                column: "FineTuningLogId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledModels_ExtractedDataId",
                table: "ScheduledModels",
                column: "ExtractedDataId");

            migrationBuilder.CreateIndex(
                name: "IX_FineTuningLogs_ScheduledModelId1",
                table: "FineTuningLogs",
                column: "ScheduledModelId1");

            migrationBuilder.AddForeignKey(
                name: "FK_FineTuningLogs_ScheduledModels_ScheduledModelId1",
                table: "FineTuningLogs",
                column: "ScheduledModelId1",
                principalTable: "ScheduledModels",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledModels_ExtractedData_ExtractedDataId",
                table: "ScheduledModels",
                column: "ExtractedDataId",
                principalTable: "ExtractedData",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UploadedDocs_FineTuningLogs_FineTuningLogId",
                table: "UploadedDocs",
                column: "FineTuningLogId",
                principalTable: "FineTuningLogs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FineTuningLogs_ScheduledModels_ScheduledModelId1",
                table: "FineTuningLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledModels_ExtractedData_ExtractedDataId",
                table: "ScheduledModels");

            migrationBuilder.DropForeignKey(
                name: "FK_UploadedDocs_FineTuningLogs_FineTuningLogId",
                table: "UploadedDocs");

            migrationBuilder.DropIndex(
                name: "IX_UploadedDocs_FineTuningLogId",
                table: "UploadedDocs");

            migrationBuilder.DropIndex(
                name: "IX_ScheduledModels_ExtractedDataId",
                table: "ScheduledModels");

            migrationBuilder.DropIndex(
                name: "IX_FineTuningLogs_ScheduledModelId1",
                table: "FineTuningLogs");

            migrationBuilder.DropColumn(
                name: "FineTuningLogId",
                table: "UploadedDocs");

            migrationBuilder.DropColumn(
                name: "ExtractedDataId",
                table: "ScheduledModels");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ScheduledModels");

            migrationBuilder.DropColumn(
                name: "ScheduledModelId1",
                table: "FineTuningLogs");

            migrationBuilder.AddColumn<List<Guid>>(
                name: "FileIds",
                table: "ScheduledModels",
                type: "uuid[]",
                nullable: false);

            migrationBuilder.AddColumn<Guid>(
                name: "DocId",
                table: "FineTuningLogs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_FineTuningLogs_DocId",
                table: "FineTuningLogs",
                column: "DocId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FineTuningLogs_UploadedDocs_DocId",
                table: "FineTuningLogs",
                column: "DocId",
                principalTable: "UploadedDocs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
