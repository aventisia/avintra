using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateTimeTrigger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TriggersFlowVersion");

            migrationBuilder.DropTable(
                name: "Triggers");

            migrationBuilder.CreateTable(
                name: "worc_TimeTriggers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Timezone = table.Column<string>(type: "text", nullable: false),
                    Frequency = table.Column<string>(type: "text", nullable: false),
                    SetupObject = table.Column<string>(type: "text", nullable: false),
                    EffectiveDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastTriggeredTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    NextTriggerTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ExceptionHours = table.Column<List<int>>(type: "integer[]", nullable: true),
                    ExceptionWeekdays = table.Column<int[]>(type: "integer[]", nullable: true),
                    ExceptionDates = table.Column<List<DateTime>>(type: "timestamp with time zone[]", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_worc_TimeTriggers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_worc_TimeTriggers_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_TimeTriggers_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "worc_FlowVersions",
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
                    table.PrimaryKey("PK_worc_FlowVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_worc_FlowVersions_FlowVersions_FlowVersionId",
                        column: x => x.FlowVersionId,
                        principalTable: "FlowVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_FlowVersions_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_FlowVersions_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_FlowVersions_worc_TimeTriggers_TriggerId",
                        column: x => x.TriggerId,
                        principalTable: "worc_TimeTriggers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_worc_FlowVersions_CreatedByUserId",
                table: "worc_FlowVersions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_FlowVersions_FlowVersionId",
                table: "worc_FlowVersions",
                column: "FlowVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_FlowVersions_LastModifiedByUserId",
                table: "worc_FlowVersions",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_FlowVersions_TriggerId",
                table: "worc_FlowVersions",
                column: "TriggerId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_TimeTriggers_CreatedByUserId",
                table: "worc_TimeTriggers",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_TimeTriggers_LastModifiedByUserId",
                table: "worc_TimeTriggers",
                column: "LastModifiedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "worc_FlowVersions");

            migrationBuilder.DropTable(
                name: "worc_TimeTriggers");

            migrationBuilder.CreateTable(
                name: "Triggers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    DisableAutomaticaly = table.Column<bool>(type: "boolean", nullable: false),
                    EndsOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Environment = table.Column<string>(type: "text", nullable: false),
                    Frequency = table.Column<string>(type: "text", nullable: false),
                    HasFailedAlert = table.Column<bool>(type: "boolean", nullable: false),
                    HasNonWorkingDays = table.Column<bool>(type: "boolean", nullable: false),
                    HasNonWorkingTime = table.Column<bool>(type: "boolean", nullable: false),
                    HasStuckAlert = table.Column<bool>(type: "boolean", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsEnds = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    NonWorkingDays = table.Column<DateTime[]>(type: "TIMESTAMP[]", nullable: true),
                    NonWorkingTimeFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NonWorkingTimeTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RepeateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RepeateEvery = table.Column<int>(type: "integer", nullable: true),
                    RepeateOn = table.Column<string[]>(type: "TEXT[]", nullable: true),
                    StartsOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Timezone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TriggerForNewEmail = table.Column<bool>(type: "boolean", nullable: false),
                    TriggerForNewItem = table.Column<bool>(type: "boolean", nullable: false),
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
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TriggerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
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
    }
}
