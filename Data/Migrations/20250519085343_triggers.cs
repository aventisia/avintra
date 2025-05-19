using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class triggers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Triggers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Environment = table.Column<string>(type: "text", nullable: false),
                    Timezone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StartsOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Frequency = table.Column<string>(type: "text", nullable: false),
                    RepeateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RepeateOn = table.Column<string[]>(type: "TEXT[]", nullable: true),
                    RepeateEvery = table.Column<int>(type: "integer", nullable: true),
                    HasNonWorkingDays = table.Column<bool>(type: "boolean", nullable: false),
                    NonWorkingDays = table.Column<DateTime[]>(type: "TIMESTAMP[]", nullable: true),
                    HasNonWorkingTime = table.Column<bool>(type: "boolean", nullable: false),
                    NonWorkingTimeFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NonWorkingTimeTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsEnds = table.Column<bool>(type: "boolean", nullable: false),
                    EndsOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TriggerForNewItem = table.Column<bool>(type: "boolean", nullable: false),
                    TriggerForNewEmail = table.Column<bool>(type: "boolean", nullable: false),
                    DisableAutomaticaly = table.Column<bool>(type: "boolean", nullable: false),
                    HasStuckAlert = table.Column<bool>(type: "boolean", nullable: false),
                    HasFailedAlert = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Triggers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Triggers_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Triggers_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TriggersFlowVersion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    TriggerId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TriggersFlowVersion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TriggersFlowVersion_FlowVersions_FlowVersionId",
                        column: x => x.FlowVersionId,
                        principalTable: "FlowVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TriggersFlowVersion_Triggers_TriggerId",
                        column: x => x.TriggerId,
                        principalTable: "Triggers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TriggersFlowVersion_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TriggersFlowVersion_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Triggers_CreatedByUserId",
                table: "Triggers",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Triggers_LastModifiedByUserId",
                table: "Triggers",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TriggersFlowVersion_CreatedByUserId",
                table: "TriggersFlowVersion",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TriggersFlowVersion_FlowVersionId",
                table: "TriggersFlowVersion",
                column: "FlowVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_TriggersFlowVersion_LastModifiedByUserId",
                table: "TriggersFlowVersion",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TriggersFlowVersion_TriggerId",
                table: "TriggersFlowVersion",
                column: "TriggerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TriggersFlowVersion");

            migrationBuilder.DropTable(
                name: "Triggers");
        }
    }
}
