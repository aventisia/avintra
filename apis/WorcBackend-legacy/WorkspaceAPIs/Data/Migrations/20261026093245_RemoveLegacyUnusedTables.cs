using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLegacyUnusedTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // IMPORTANT NOTE: The KeyStore -> ConfigStore entity rename (14a52b361) shipped without a
            // migration. Rename the legacy table, its constraints and indexes here; the guards keep
            // databases that were renamed by hand unaffected.
            migrationBuilder.Sql(
                """
                DO $$
                BEGIN
                    IF to_regclass('"KeyStores"') IS NOT NULL AND to_regclass('"ConfigStores"') IS NULL THEN
                        ALTER TABLE "KeyStores" RENAME TO "ConfigStores";
                    END IF;
                END $$;

                ALTER INDEX IF EXISTS "IX_KeyStores_CreatedByUserId" RENAME TO "IX_ConfigStores_CreatedByUserId";
                ALTER INDEX IF EXISTS "IX_KeyStores_LastModifiedByUserId" RENAME TO "IX_ConfigStores_LastModifiedByUserId";
                ALTER INDEX IF EXISTS "IX_KeyStores_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_ConfigStores_TenantId_SpaceId_EnvType_Name";

                DO $$
                BEGIN
                    IF to_regclass('"ConfigStores"') IS NOT NULL THEN
                        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PK_KeyStores') THEN
                            ALTER TABLE "ConfigStores" RENAME CONSTRAINT "PK_KeyStores" TO "PK_ConfigStores";
                        END IF;
                        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_KeyStores_WorkspaceUsers_CreatedByUserId') THEN
                            ALTER TABLE "ConfigStores" RENAME CONSTRAINT "FK_KeyStores_WorkspaceUsers_CreatedByUserId" TO "FK_ConfigStores_WorkspaceUsers_CreatedByUserId";
                        END IF;
                        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_KeyStores_WorkspaceUsers_LastModifiedByUserId') THEN
                            ALTER TABLE "ConfigStores" RENAME CONSTRAINT "FK_KeyStores_WorkspaceUsers_LastModifiedByUserId" TO "FK_ConfigStores_WorkspaceUsers_LastModifiedByUserId";
                        END IF;
                    END IF;
                END $$;
                """);

            migrationBuilder.DropTable(
                name: "FlowLog");

            migrationBuilder.DropTable(
                name: "SupportTicketRemark");

            migrationBuilder.DropTable(
                name: "worc_FlowVersions");

            migrationBuilder.DropTable(
                name: "worc_FlowVersionUsers");

            migrationBuilder.DropTable(
                name: "worc_PromptTemplates");

            migrationBuilder.DropTable(
                name: "SupportTicket");

            migrationBuilder.DropTable(
                name: "worc_TimeTriggers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FlowLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowId = table.Column<Guid>(type: "uuid", nullable: false),
                    Duration = table.Column<long>(type: "bigint", nullable: false),
                    Remark = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    StartTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Version = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlowLog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FlowLog_Flows_FlowId",
                        column: x => x.FlowId,
                        principalTable: "Flows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupportTicket",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Priority = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: true),
                    Subject = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketNumber = table.Column<string>(type: "text", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportTicket", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupportTicket_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SupportTicket_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SupportTicket_WorkspaceUsers_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "worc_TimeTriggers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AtTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CronExpression = table.Column<string>(type: "text", nullable: false),
                    EffectiveDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ExceptionDates = table.Column<List<DateOnly>>(type: "date[]", nullable: true),
                    ExceptionHours = table.Column<List<int>>(type: "integer[]", nullable: true),
                    ExceptionWeekdays = table.Column<List<int>>(type: "integer[]", nullable: true),
                    Frequency = table.Column<string>(type: "text", nullable: false),
                    Interval = table.Column<int>(type: "integer", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsTenantWideAccess = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastTriggeredTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    MonthDays = table.Column<List<int>>(type: "integer[]", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    NextTriggerTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    SpaceId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Timezone = table.Column<string>(type: "text", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    Weekdays = table.Column<List<int>>(type: "integer[]", nullable: true)
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
                name: "SupportTicketRemark",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SupportTicketId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AvatarSrc = table.Column<string>(type: "text", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Initials = table.Column<string>(type: "text", nullable: true),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsEdited = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketNumber = table.Column<string>(type: "text", nullable: true),
                    UserFullName = table.Column<string>(type: "text", nullable: true),
                    UserName = table.Column<string>(type: "text", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportTicketRemark", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupportTicketRemark_SupportTicket_SupportTicketId",
                        column: x => x.SupportTicketId,
                        principalTable: "SupportTicket",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SupportTicketRemark_WorkspaceUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "worc_PromptTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccessType = table.Column<string>(type: "text", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsJsonOutput = table.Column<bool>(type: "boolean", nullable: false),
                    JsonSchema = table.Column<string>(type: "text", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    MaxOutputTokens = table.Column<int>(type: "integer", nullable: false),
                    Model = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ModelProvider = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Stream = table.Column<bool>(type: "boolean", nullable: false),
                    SystemInput = table.Column<string>(type: "text", nullable: false),
                    Temperature = table.Column<float>(type: "real", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    TopP = table.Column<float>(type: "real", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_worc_PromptTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_worc_PromptTemplates_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_PromptTemplates_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "worc_FlowVersionUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_worc_FlowVersionUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_worc_FlowVersionUsers_FlowVersions_FlowVersionId",
                        column: x => x.FlowVersionId,
                        principalTable: "FlowVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_FlowVersionUsers_WorkspaceUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "worc_FlowVersions",
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
                name: "IX_FlowLog_FlowId",
                table: "FlowLog",
                column: "FlowId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTicket_CreatedByUserId",
                table: "SupportTicket",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTicket_LastModifiedByUserId",
                table: "SupportTicket",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTicket_ReviewerId",
                table: "SupportTicket",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTicket_TicketNumber",
                table: "SupportTicket",
                column: "TicketNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupportTicketRemark_SupportTicketId",
                table: "SupportTicketRemark",
                column: "SupportTicketId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTicketRemark_UserId",
                table: "SupportTicketRemark",
                column: "UserId");

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
                name: "IX_worc_FlowVersionUsers_FlowVersionId",
                table: "worc_FlowVersionUsers",
                column: "FlowVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_FlowVersionUsers_UserId",
                table: "worc_FlowVersionUsers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_PromptTemplates_CreatedByUserId",
                table: "worc_PromptTemplates",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_PromptTemplates_LastModifiedByUserId",
                table: "worc_PromptTemplates",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_TimeTriggers_CreatedByUserId",
                table: "worc_TimeTriggers",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_TimeTriggers_LastModifiedByUserId",
                table: "worc_TimeTriggers",
                column: "LastModifiedByUserId");

            // IMPORTANT NOTE: Reverse the KeyStores -> ConfigStores rename applied in Up().
            migrationBuilder.Sql(
                """
                DO $$
                BEGIN
                    IF to_regclass('"ConfigStores"') IS NOT NULL AND to_regclass('"KeyStores"') IS NULL THEN
                        ALTER TABLE "ConfigStores" RENAME TO "KeyStores";
                    END IF;
                END $$;

                ALTER INDEX IF EXISTS "IX_ConfigStores_CreatedByUserId" RENAME TO "IX_KeyStores_CreatedByUserId";
                ALTER INDEX IF EXISTS "IX_ConfigStores_LastModifiedByUserId" RENAME TO "IX_KeyStores_LastModifiedByUserId";
                ALTER INDEX IF EXISTS "IX_ConfigStores_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_KeyStores_TenantId_SpaceId_EnvType_Name";

                DO $$
                BEGIN
                    IF to_regclass('"KeyStores"') IS NOT NULL THEN
                        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PK_ConfigStores') THEN
                            ALTER TABLE "KeyStores" RENAME CONSTRAINT "PK_ConfigStores" TO "PK_KeyStores";
                        END IF;
                        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_ConfigStores_WorkspaceUsers_CreatedByUserId') THEN
                            ALTER TABLE "KeyStores" RENAME CONSTRAINT "FK_ConfigStores_WorkspaceUsers_CreatedByUserId" TO "FK_KeyStores_WorkspaceUsers_CreatedByUserId";
                        END IF;
                        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_ConfigStores_WorkspaceUsers_LastModifiedByUserId') THEN
                            ALTER TABLE "KeyStores" RENAME CONSTRAINT "FK_ConfigStores_WorkspaceUsers_LastModifiedByUserId" TO "FK_KeyStores_WorkspaceUsers_LastModifiedByUserId";
                        END IF;
                    END IF;
                END $$;
                """);
        }
    }
}
