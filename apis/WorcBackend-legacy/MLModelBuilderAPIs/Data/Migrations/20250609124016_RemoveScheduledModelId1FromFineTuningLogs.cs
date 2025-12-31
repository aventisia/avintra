using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveScheduledModelId1FromFineTuningLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FineTuningLogs_ScheduledModels_ScheduledModelId1",
                table: "FineTuningLogs");

            migrationBuilder.DropIndex(
                name: "IX_FineTuningLogs_ScheduledModelId1",
                table: "FineTuningLogs");

            migrationBuilder.DropColumn(
                name: "ScheduledModelId1",
                table: "FineTuningLogs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ScheduledModelId1",
                table: "FineTuningLogs",
                type: "uuid",
                nullable: true);

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
        }
    }
}
