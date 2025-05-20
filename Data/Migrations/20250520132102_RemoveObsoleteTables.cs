using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveObsoleteTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FieldSetups");

            migrationBuilder.DropTable(
                name: "TableHeaders");

            migrationBuilder.DropTable(
                name: "TableMetadata");

            migrationBuilder.DropTable(
                name: "ExtractionSetups");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExtractionSetups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    MLModelId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    DocumentContext = table.Column<string>(type: "text", nullable: true),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    NodePrompt = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExtractionSetups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExtractionSetups_MLModels_MLModelId",
                        column: x => x.MLModelId,
                        principalTable: "MLModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExtractionSetups_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExtractionSetups_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FieldSetups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExtractionSetupId = table.Column<Guid>(type: "uuid", nullable: false),
                    Instructions = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FieldSetups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FieldSetups_ExtractionSetups_ExtractionSetupId",
                        column: x => x.ExtractionSetupId,
                        principalTable: "ExtractionSetups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TableMetadata",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExtractionSetupId = table.Column<Guid>(type: "uuid", nullable: false),
                    Context = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TableMetadata", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TableMetadata_ExtractionSetups_ExtractionSetupId",
                        column: x => x.ExtractionSetupId,
                        principalTable: "ExtractionSetups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TableHeaders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TableMetadataId = table.Column<Guid>(type: "uuid", nullable: false),
                    Instructions = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TableHeaders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TableHeaders_TableMetadata_TableMetadataId",
                        column: x => x.TableMetadataId,
                        principalTable: "TableMetadata",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExtractionSetups_CreatedByUserId",
                table: "ExtractionSetups",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ExtractionSetups_LastModifiedByUserId",
                table: "ExtractionSetups",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ExtractionSetups_MLModelId",
                table: "ExtractionSetups",
                column: "MLModelId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldSetups_ExtractionSetupId",
                table: "FieldSetups",
                column: "ExtractionSetupId");

            migrationBuilder.CreateIndex(
                name: "IX_TableHeaders_TableMetadataId",
                table: "TableHeaders",
                column: "TableMetadataId");

            migrationBuilder.CreateIndex(
                name: "IX_TableMetadata_ExtractionSetupId",
                table: "TableMetadata",
                column: "ExtractionSetupId");
        }
    }
}
