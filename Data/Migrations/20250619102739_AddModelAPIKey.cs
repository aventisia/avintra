using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddModelAPIKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ModelAPIKeys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApiKey = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    MLModelId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelAPIKeys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelAPIKeys_MLModels_MLModelId",
                        column: x => x.MLModelId,
                        principalTable: "MLModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModelAPIKeys_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModelAPIKeys_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ModelAPIKeys_CreatedByUserId",
                table: "ModelAPIKeys",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelAPIKeys_LastModifiedByUserId",
                table: "ModelAPIKeys",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelAPIKeys_MLModelId",
                table: "ModelAPIKeys",
                column: "MLModelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ModelAPIKeys");
        }
    }
}
