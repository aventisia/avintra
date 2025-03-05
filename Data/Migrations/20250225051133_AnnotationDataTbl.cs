using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Migrations
{
    /// <inheritdoc />
    public partial class AnnotationDataTbl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AnnotationData",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MLModelId = table.Column<Guid>(type: "uuid", nullable: false),
                    UploadedDocId = table.Column<Guid>(type: "uuid", nullable: false),
                    AnnotationObject = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnnotationData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnnotationData_MLModels_MLModelId",
                        column: x => x.MLModelId,
                        principalTable: "MLModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AnnotationData_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AnnotationData_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AnnotationData_UploadedDocs_UploadedDocId",
                        column: x => x.UploadedDocId,
                        principalTable: "UploadedDocs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnnotationData_CreatedByUserId",
                table: "AnnotationData",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AnnotationData_LastModifiedByUserId",
                table: "AnnotationData",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AnnotationData_MLModelId",
                table: "AnnotationData",
                column: "MLModelId");

            migrationBuilder.CreateIndex(
                name: "IX_AnnotationData_UploadedDocId",
                table: "AnnotationData",
                column: "UploadedDocId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnnotationData");
        }
    }
}
