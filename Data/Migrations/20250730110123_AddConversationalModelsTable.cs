using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddConversationalModelsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ConfigurationType",
                table: "ModelTasks",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateTable(
                name: "ConversationalModels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ConfigurationType = table.Column<string>(type: "text", nullable: false),
                    LLM = table.Column<string>(type: "text", nullable: false),
                    SecretKey = table.Column<string>(type: "text", nullable: true),
                    NodePrompt = table.Column<string>(type: "text", nullable: false),
                    Temperature = table.Column<double>(type: "double precision", nullable: false),
                    SetupObject = table.Column<string>(type: "text", nullable: true),
                    GeneratedPrompt = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_ConversationalModels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConversationalModels_MLModels_MLModelId",
                        column: x => x.MLModelId,
                        principalTable: "MLModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConversationalModels_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConversationalModels_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConversationalModels_CreatedByUserId",
                table: "ConversationalModels",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationalModels_LastModifiedByUserId",
                table: "ConversationalModels",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationalModels_MLModelId",
                table: "ConversationalModels",
                column: "MLModelId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConversationalModels");

            migrationBuilder.AlterColumn<int>(
                name: "ConfigurationType",
                table: "ModelTasks",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
