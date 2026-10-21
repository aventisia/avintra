using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class MigrateQueueAgentAccessToResourceFlowAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // IMPORTANT NOTE: queue agent access moves from the legacy per-version table to
            // ws_ResourceFlowAccess. Per-version grants and AccessType are not carried over; the
            // Down migration recreates the dropped table's shape only, never its data.
            migrationBuilder.AddColumn<bool>(
                name: "IsResourceAccessRestricted",
                table: "Queues",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // IMPORTANT NOTE: a queue with legacy per-version links keeps its existing restriction
            // through the per-flow backfill, so it must start restricted; queues without links stay open.
            migrationBuilder.Sql(
                """
                UPDATE "Queues" AS q
                SET "IsResourceAccessRestricted" = TRUE
                WHERE EXISTS (SELECT 1 FROM "QueueFlowVersion" AS qfv WHERE qfv."QueueId" = q."Id");
                """);

            // IMPORTANT NOTE: grants collapse from per-version to per-flow, so a flow linked through
            // ANY of its versions becomes usable by ALL of them; AccessType is intentionally not carried.
            migrationBuilder.Sql(
                """
                INSERT INTO "ws_ResourceFlowAccess" ("Id", "TenantId", "ResourceType", "ResourceId", "FlowId", "CreatedByUserId", "CreatedAt")
                SELECT gen_random_uuid(), legacy."TenantId", 'Queue', legacy."QueueId", legacy."FlowId", legacy."CreatedByUserId", NOW()
                FROM (
                    SELECT DISTINCT ON (qfv."TenantId", qfv."QueueId", fv."FlowId")
                        qfv."TenantId",
                        qfv."QueueId",
                        fv."FlowId",
                        qfv."CreatedByUserId"
                    FROM "QueueFlowVersion" AS qfv
                    INNER JOIN "FlowVersions" AS fv ON fv."Id" = qfv."FlowVersionId"
                    ORDER BY qfv."TenantId", qfv."QueueId", fv."FlowId", qfv."CreatedOn"
                ) AS legacy
                ON CONFLICT ("TenantId", "ResourceType", "ResourceId", "FlowId") DO NOTHING;
                """);

            migrationBuilder.DropTable(
                name: "QueueFlowVersion");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "QueueFlowVersion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    QueueId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccessType = table.Column<string>(type: "text", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QueueFlowVersion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QueueFlowVersion_FlowVersions_FlowVersionId",
                        column: x => x.FlowVersionId,
                        principalTable: "FlowVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QueueFlowVersion_Queues_QueueId",
                        column: x => x.QueueId,
                        principalTable: "Queues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QueueFlowVersion_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QueueFlowVersion_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_QueueFlowVersion_CreatedByUserId",
                table: "QueueFlowVersion",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_QueueFlowVersion_FlowVersionId",
                table: "QueueFlowVersion",
                column: "FlowVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_QueueFlowVersion_LastModifiedByUserId",
                table: "QueueFlowVersion",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_QueueFlowVersion_QueueId_FlowVersionId",
                table: "QueueFlowVersion",
                columns: new[] { "QueueId", "FlowVersionId" },
                unique: true);

            migrationBuilder.DropColumn(
                name: "IsResourceAccessRestricted",
                table: "Queues");
        }
    }
}
