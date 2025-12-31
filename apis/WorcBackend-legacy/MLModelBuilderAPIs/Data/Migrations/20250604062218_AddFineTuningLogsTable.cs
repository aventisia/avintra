using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFineTuningLogsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FineTuningLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    DocId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduledModelId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FineTuningLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FineTuningLogs_ScheduledModels_ScheduledModelId",
                        column: x => x.ScheduledModelId,
                        principalTable: "ScheduledModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FineTuningLogs_UploadedDocs_DocId",
                        column: x => x.DocId,
                        principalTable: "UploadedDocs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FineTuningLogs_DocId",
                table: "FineTuningLogs",
                column: "DocId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FineTuningLogs_ScheduledModelId",
                table: "FineTuningLogs",
                column: "ScheduledModelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FineTuningLogs");
        }
    }
}
